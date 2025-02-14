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

	self.socket.on('command_result', (result: string) => {
		if (self.config.verbose) {
			self.log('debug', `Command result: ${result}`)
		}
	})

	self.socket.on('system_info', (systemInfo) => {
		processSystemInfo(self, systemInfo)
	})
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

		self.systemInfo.memory.total = systemInfo.memory.total || 0
		self.systemInfo.memory.free = systemInfo.memory.free || 0
		self.systemInfo.memory.used = systemInfo.memory.used || 0
		self.systemInfo.memory.active = systemInfo.memory.active || 0
		self.systemInfo.memory.available = systemInfo.memory.available || 0

		self.setVariableValues({
			memory_total: self.systemInfo.memory.total,
			memory_free: self.systemInfo.memory.free,
			memory_used: self.systemInfo.memory.used,
			memory_active: self.systemInfo.memory.active,
			memory_available: self.systemInfo.memory.available,
		})

		//see if systeminfo.networkInterfaces length is different than current, and rebuild variables if so
		if (systemInfo && systemInfo.networkInterfaces && systemInfo.networkInterfaces.length > 0) {
			if (self.systemInfo.networkInterfaces.length != systemInfo.networkInterfaces.length) {
				self.systemInfo.networkInterfaces = systemInfo.networkInterfaces
				UpdateVariableDefinitions(self)
			}

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

			self.systemInfo.networkStats.forEach((nic) => {
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

				self.setVariableValues({
					[`nic_${nic.iface}_rx_bytes`]: nic.rx_bytes,
					[`nic_${nic.iface}_rx_errors`]: nic.rx_errors,

					[`nic_${nic.iface}_tx_bytes`]: nic.tx_bytes,
					[`nic_${nic.iface}_tx_errors`]: nic.tx_errors,

					[`nic_${nic.iface}_rx_sec`]: nic.rx_sec,
					[`nic_${nic.iface}_tx_sec`]: nic.tx_sec,

					[`nic_${nic.iface}_rx_sec_mb`]: nic.rx_sec_mb,
					[`nic_${nic.iface}_tx_sec_mb`]: nic.tx_sec_mb,
				})
			})
		}
	} catch (error) {
		self.log('error', `Error processing system info: ${error}`)
	}
}
