import { InstanceStatus } from '@companion-module/base'
import type { ScriptLauncherInstance } from './main.js'

import { UpdateVariableDefinitions, CheckVariables } from './variables.js'

import { io } from 'socket.io-client'

export async function InitConnection(self: ScriptLauncherInstance): Promise<void> {
	// Initialize Socket.IO connection
	const ip = self.config.ip
	const port = self.config.port

	if (self.config.verbose) {
		self.log('debug', `Connecting to ScriptLauncher at ${ip}:${port}`)
	}

	self.socket = io(`http://${ip}:${port}`)

	self.updateStatus(InstanceStatus.Connecting)

	self.socket.on('connect', () => {
		self.log('info', 'Connected to ScriptLauncher')
		self.connected = true
		self.updateStatus(InstanceStatus.Ok)
		CheckVariables(self)
	})

	self.socket.on('disconnect', () => {
		self.log('info', 'Disconnected from ScriptLauncher')
		self.connected = false
		self.updateStatus(InstanceStatus.ConnectionFailure)
		CheckVariables(self)
	})

	self.socket.on('error', (error: string) => {
		self.log('error', `Error from ScriptLauncher: ${error}`)
		self.updateStatus(InstanceStatus.UnknownError)
		CheckVariables(self)
	})

	self.socket.on('command_result', (obj: any) => {
		try {
			if (obj && obj.command && obj.result) {
				processCommandResult(self, obj)
			} else if (obj && obj.command && obj.error) {
				self.log('error', `Error from ScriptLauncher: ${obj.command}: ${obj.error}`)
			} else {
				self.log('error', `Invalid command result: ${JSON.stringify(obj)}`)
			}
		} catch (error) {
			self.log('error', `Error processing command result: ${error}`)
		}
	})
}

function processCommandResult(self: ScriptLauncherInstance, obj: any): void {
	//if obj.error is not empty, log it
	if (obj.error) {
		self.log('error', `Error from ScriptLauncher: ${obj.command}: ${obj.error}`)
		self.updateStatus(InstanceStatus.UnknownError)
		return
	}

	switch (obj.command) {
		case 'platform':
			let platform = obj.result.platform
			//if platform is 'darwin', set platform to 'mac'
			if (platform == 'darwin') {
				platform = 'mac'
			} else if (platform == 'win32') {
				//if platform is 'win32', set platform to 'windows'
				platform = 'windows'
			}

			self.platform = platform

			if (self.config.verbose) {
				self.log('debug', `Platform: ${platform}`)
				self.log('debug', `Version: ${obj.result.version}`)
				self.log('debug', `Arch: ${obj.result.arch}`)
				self.log('debug', `Hostname: ${obj.result.hostname}`)
			}

			//set platform variables
			let variableObj = {
				platform: platform,
				version: obj.result.version,
				arch: obj.result.arch,
				hostname: obj.result.hostname,
			}
			self.setVariableValues(variableObj)

			break
		case 'uptime':
			const uptimeSeconds = obj.result.uptime || 0

			const days = Math.floor(uptimeSeconds / (60 * 60 * 24))
			const hours = Math.floor((uptimeSeconds % (60 * 60 * 24)) / (60 * 60))
			const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60)

			const uptimePretty = `${days}d ${hours}h ${minutes}m`

			self.setVariableValues({
				uptime: uptimePretty,
			})
			break
		case 'getSystemInfo':
			if (self.config.verbose) {
				self.log('debug', `System Info: ${JSON.stringify(obj.result)}`)
			}
			processSystemInfo(self, obj.result)
			break
		case 'getFonts':
			self.fonts = obj.result || []
			UpdateVariableDefinitions(self)
			buildFontChoices(self)
			self.setVariableValues({
				fonts: JSON.stringify(self.fonts), // Store fonts as a JSON string
			})
			break
		case 'focusApp':
			if (self.config.verbose) {
				self.log('debug', `Focus App: ${JSON.stringify(obj.result)}`)
			}
			break
		case 'quitApp':
			if (self.config.verbose) {
				self.log('debug', `Quit App: ${JSON.stringify(obj.result)}`)
			}
			break
		case 'runScript':
			if (self.config.verbose) {
				self.log('debug', `Run Script: ${JSON.stringify(obj.result)}`)
			}
			break
		case 'sendInput':
			if (self.config.verbose) {
				self.log('debug', `Send Input: ${JSON.stringify(obj.result)}`)
			}
			break
		case 'sendAlert':
			if (self.config.verbose) {
				self.log('debug', `Send Alert: ${JSON.stringify(obj.result)}`)
			}
			break
		case 'moveFile':
			if (self.config.verbose) {
				self.log('debug', `Move File: ${JSON.stringify(obj.result)}`)
			}
			break
		default:
			self.log('debug', `Unknown command result: ${obj.command}`)
			break
	}
}

function processSystemInfo(self: ScriptLauncherInstance, systemInfo: any): void {
	if (self.config.verbose) {
		self.log('debug', `System Info: ${JSON.stringify(systemInfo)}`)
	}

	try {
		//only update if first time or if different than current systemInfo
		if (self.systemInfo.cpu.manufacturer == '') {
			self.systemInfo.cpu = {
				manufacturer: systemInfo.cpu.manufacturer || '',
				brand: systemInfo.cpu.brand || '',
				speed: systemInfo.cpu.speed || 0,
				cores: systemInfo.cpu.cores || 0,
			}

			self.setVariableValues({
				cpu_manufacturer: self.systemInfo.cpu.manufacturer,
				cpu_brand: self.systemInfo.cpu.brand,
				cpu_speed: self.systemInfo.cpu.speed,
				cpu_cores: self.systemInfo.cpu.cores,
			})
		}

		//update CPU temperature if available
		if (systemInfo.cpuTemp) {
			self.systemInfo.cpuTemp = {
				main: systemInfo.cpuTemp.main || null,
				max: systemInfo.cpuTemp.max || null,
				cores: systemInfo.cpuTemp.cores || [],
				socket: systemInfo.cpuTemp.socket || [],
				chipset: systemInfo.cpuTemp.chipset || null,
			}

			self.setVariableValues({
				cpu_temp: self.systemInfo.cpuTemp?.main != null ? self.systemInfo.cpuTemp.main.toFixed(1) : 'Unavailable',
			})
		}

		if (systemInfo.currentLoad) {
			self.systemInfo.currentLoad = {
				avgLoad: systemInfo.currentLoad.avgLoad || 0,
				currentLoad: systemInfo.currentLoad.currentLoad || 0,
				currentLoadUser: systemInfo.currentLoad.currentLoadUser || 0,
				currentLoadSystem: systemInfo.currentLoad.currentLoadSystem || 0,
				currentLoadIdle: systemInfo.currentLoad.currentLoadIdle || 0,
			}

			//round each to nearest 2 decimal places
			self.setVariableValues({
				cpu_load_avg: Math.round(self.systemInfo.currentLoad.avgLoad * 100) / 100,
				cpu_load_current: Math.round(self.systemInfo.currentLoad.currentLoad * 100) / 100,
				cpu_load_user: Math.round(self.systemInfo.currentLoad.currentLoadUser * 100) / 100,
				cpu_load_system: Math.round(self.systemInfo.currentLoad.currentLoadSystem * 100) / 100,
				cpu_load_idle: Math.round(self.systemInfo.currentLoad.currentLoadIdle * 100) / 100,
			})
		}

		//Memory Info
		self.systemInfo.memory.total = systemInfo.memory.total || 0
		self.systemInfo.memory.free = systemInfo.memory.free || 0
		self.systemInfo.memory.used = systemInfo.memory.used || 0
		self.systemInfo.memory.active = systemInfo.memory.active || 0
		self.systemInfo.memory.available = systemInfo.memory.available || 0

		self.setVariableValues({
			memory_total: formatBytes(self.systemInfo.memory.total),
			memory_free: formatBytes(self.systemInfo.memory.free),
			memory_used: formatBytes(self.systemInfo.memory.used),
			memory_active: formatBytes(self.systemInfo.memory.active),
			memory_available: formatBytes(self.systemInfo.memory.available),
		})

		// Disk Info
		if (systemInfo.fsSize && Array.isArray(systemInfo.fsSize)) {
			self.systemInfo.disks = systemInfo.fsSize
			self.systemInfo.disks = self.systemInfo.disks?.filter((disk) => isRealVolume(disk, self.platform))

			buildDiskChoices(self)

			self.systemInfo.disks.forEach((disk: any, index: number) => {
				const safeId = getSafeDiskId(disk.mount, index)

				self.setVariableValues({
					[`disk_${safeId}_mount`]: disk.mount,
					[`disk_${safeId}_fs`]: disk.fs,
					[`disk_${safeId}_type`]: disk.type,
					[`disk_${safeId}_size`]: formatBytes(disk.size),
					[`disk_${safeId}_used`]: formatBytes(disk.used),
					[`disk_${safeId}_available`]: formatBytes(disk.available),
					[`disk_${safeId}_use_percent`]: `${disk.use?.toFixed(1) ?? '?'}%`,
				})
			})
		}

		// GPU info
		if (systemInfo.gpu) {
			self.systemInfo.gpu = {
				controllers: systemInfo.gpu.controllers || [],
				displays: systemInfo.gpu.displays || [],
			}

			// For now, we’ll just expose first controller as variables
			const gpu = self.systemInfo.gpu.controllers[0]
			if (gpu) {
				self.setVariableValues({
					gpu_vendor: gpu.vendor || 'Unknown',
					gpu_model: gpu.model || 'Unknown',
					gpu_vram: gpu.vram != null ? gpu.vram : 'Unknown',
					gpu_bus: gpu.bus || 'Unknown',
					gpu_cores: gpu.cores || 'Unknown',
				})

				// If utilization is available (e.g., NVIDIA), include it
				if (gpu.utilizationGpu != null) {
					self.setVariableValues({
						gpu_utilization: gpu.utilizationGpu.toFixed(1),
					})
				} else {
					self.setVariableValues({
						gpu_utilization: 'Unavailable',
					})
				}
			}
		}

		//Network Info
		if (systemInfo && systemInfo.networkInterfaces && systemInfo.networkInterfaces.length > 0) {
			self.systemInfo.networkInterfaces = systemInfo.networkInterfaces
			buildNICChoices(self)

			self.systemInfo.networkInterfaces.forEach((nic) => {
				self.setVariableValues({
					[`nic_${nic.iface}_iface`]: nic.iface,
					[`nic_${nic.iface}_ifaceName`]: nic.ifaceName,
					[`nic_${nic.iface}_ip4`]: nic.ip4,
					[`nic_${nic.iface}_ip4subnet`]: nic.ip4subnet,
					[`nic_${nic.iface}_ip6`]: nic.ip6,
					[`nic_${nic.iface}_ip6subnet`]: nic.ip6subnet,
					[`nic_${nic.iface}_mac`]: nic.mac,
					[`nic_${nic.iface}_internal`]: nic.internal ? 'true' : 'false',
					[`nic_${nic.iface}_virtual`]: nic.virtual ? 'true' : 'false',
					[`nic_${nic.iface}_operstate`]: nic.operstate,
					[`nic_${nic.iface}_type`]: nic.type,
					[`nic_${nic.iface}_duplex`]: nic.duplex,
					[`nic_${nic.iface}_mtu`]: nic.mtu,
					[`nic_${nic.iface}_speed`]: String(nic.speed),
					[`nic_${nic.iface}_dhcp`]: nic.dhcp ? 'true' : 'false',
				})
			})
		}

		//calculate network interface tx/rx rates (bytes/5 seconds) and then convert to seconds
		if (systemInfo.networkStats && systemInfo.networkStats.length > 0) {
			const oldStats = self.systemInfo.networkStats || []
			self.systemInfo.networkStats = systemInfo.networkStats

			self.systemInfo.networkStats.forEach((nic: any) => {
				const oldNic = oldStats.find((x) => x.iface == nic.iface)
				if (oldNic) {
					const seconds = 5
					nic.rx_sec = (nic.rx_bytes - oldNic.rx_bytes) / seconds
					nic.rx_sec_mb = nic.rx_sec / (1024 * 1024)
					nic.tx_sec = (nic.tx_bytes - oldNic.tx_bytes) / seconds
					nic.tx_sec_mb = nic.tx_sec / (1024 * 1024)
				} else {
					nic.rx_sec = 0
					nic.rx_sec_mb = 0
					nic.tx_sec = 0
					nic.tx_sec_mb = 0
				}

				if (nic.speed && nic.speed > 0) {
					const nicSpeedBytesPerSec = (nic.speed * 1_000_000) / 8 // Mbps to Bytes/sec
					nic.utilization = ((nic.rx_sec + nic.tx_sec) / nicSpeedBytesPerSec) * 100
				} else {
					nic.utilization = 0
				}

				self.setVariableValues({
					[`nic_${nic.iface}_rx_bytes`]: nic.rx_bytes,
					[`nic_${nic.iface}_rx_errors`]: nic.rx_errors,

					[`nic_${nic.iface}_tx_bytes`]: nic.tx_bytes,
					[`nic_${nic.iface}_tx_errors`]: nic.tx_errors,

					[`nic_${nic.iface}_rx_sec`]: nic.rx_sec,
					[`nic_${nic.iface}_tx_sec`]: nic.tx_sec,

					[`nic_${nic.iface}_rx_sec_mb`]: nic.rx_sec_mb,
					[`nic_${nic.iface}_tx_sec_mb`]: nic.tx_sec_mb,

					[`nic_${nic.iface}_utilization`]: nic.utilization.toFixed(2),
				})
			})
		}

		self.checkFeedbacks()
	} catch (error) {
		self.log('error', `Error processing system info: ${error}`)
	}
}

export function isRealVolume(disk: { mount: string; fs: string }, platform: string): boolean {
	const mount = disk.mount || ''

	if (platform === 'mac') {
		// Keep root, Data, and user-mounts like /Volumes/...
		if (mount === '/' || mount === '/System/Volumes/Data') return true
		if (mount.startsWith('/Volumes/')) return true
		return false
	} else if (platform === 'windows') {
		// Keep C:, D:, etc.
		return /^[A-Z]:\\?$/i.test(mount)
	} else {
		// For Linux or other: basic heuristic
		return mount === '/' || mount.startsWith('/mnt') || mount.startsWith('/media')
	}
}

export function getSafeDiskId(mount: string, index: number): string {
	if (mount === '/') return 'root'
	if (mount.toLowerCase().includes('data')) return 'data'
	if (mount.toLowerCase().includes('vm')) return 'vm'
	if (mount.toLowerCase().includes('preboot')) return 'preboot'
	if (mount.toLowerCase().includes('update')) return 'update'
	if (mount.toLowerCase().includes('hardware')) return 'hardware'
	if (mount.toLowerCase().includes('xarts')) return 'xarts'
	if (mount.toLowerCase().includes('iscpreboot')) return 'iscpreboot'

	// fallback to shorter generic ID like vol1, vol2
	return `vol${index + 1}`
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes'
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	const formatted = bytes / Math.pow(1024, i)
	return `${formatted.toFixed(1)} ${sizes[i]}`
}

function buildDiskChoices(self: ScriptLauncherInstance): void {
	const diskChoices: { id: string; label: string }[] = []

	if (self.systemInfo.disks && Array.isArray(self.systemInfo.disks)) {
		self.systemInfo.disks.forEach((disk: any, index: number) => {
			const safeId = getSafeDiskId(disk.mount, index)
			const label = `${disk.mount} (${disk.fs}`
			diskChoices.push({
				id: safeId,
				label,
			})
		})
	}

	if (diskChoices.length === 0) {
		diskChoices.push({
			id: '/',
			label: '/ (default)',
		})
	}

	diskChoices.sort((a, b) => a.label.localeCompare(b.label))

	//compare to existing choices and only update if different
	if (JSON.stringify(self.CHOICES_DISKS) === JSON.stringify(diskChoices)) {
		return // no change needed
	}

	self.CHOICES_DISKS = diskChoices
	self.updateActions() // update actions to include disk choices
	self.updateFeedbacks() // update feedbacks to include disk choices
	UpdateVariableDefinitions(self)
}

function buildFontChoices(self: ScriptLauncherInstance): void {
	const fontChoices: { id: string; label: string }[] = []
	if (self.fonts && self.fonts.length > 0) {
		self.fonts.forEach((font) => {
			fontChoices.push({
				id: font,
				label: font,
			})
		})
	} else {
		fontChoices.push({
			id: 'none',
			label: 'No Fonts Available',
		})
	}

	fontChoices.sort((a, b) => a.label.localeCompare(b.label))

	//compare to existing choices and only update if different
	if (JSON.stringify(self.CHOICES_FONTS) === JSON.stringify(fontChoices)) {
		return // no change needed
	}

	self.CHOICES_FONTS = fontChoices
	self.updateActions() // update actions to include font choices
	self.updateFeedbacks() // update feedbacks to include font choices
	UpdateVariableDefinitions(self)
}

function buildNICChoices(self: ScriptLauncherInstance): void {
	const nicChoices: { id: string; label: string }[] = []
	self.systemInfo.networkInterfaces.forEach((nic) => {
		nicChoices.push({
			id: nic.iface,
			label: `${nic.ifaceName} - ${nic.ip4 || nic.ip6 || 'No IP'}`,
		})
	})

	nicChoices.sort((a, b) => a.label.localeCompare(b.label))

	//if nicChoices.length == 0, add a default option
	if (nicChoices.length == 0) {
		nicChoices.push({
			id: 'none',
			label: 'No Network Interfaces Found',
		})
	}

	//compare to existing choices and only update if different
	if (JSON.stringify(self.CHOICES_NIC) === JSON.stringify(nicChoices)) {
		return // no change needed
	}

	self.CHOICES_NIC = nicChoices
	self.updateActions() // update actions to include NIC choices
	self.updateFeedbacks() // update feedbacks to include NIC choices
	UpdateVariableDefinitions(self)
}

export function emitAppleScript(self: ScriptLauncherInstance, script: string) {
	self.socket.emit('command', {
		command: 'runScript',
		password: self.config.password,
		executable: 'osascript',
		args: ['-e', script],
		stdin: '',
	})
}

export function emitShellCommand(self: ScriptLauncherInstance, command: string) {
	self.socket.emit('command', {
		command: 'runScript',
		password: self.config.password,
		executable: '/bin/sh',
		args: ['-c', command],
		stdin: '',
	})
}
