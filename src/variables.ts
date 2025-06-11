import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'

import type { ScriptLauncherInstance } from './main.js'

import { isRealVolume, getSafeDiskId } from './api.js'

export function UpdateVariableDefinitions(self: ScriptLauncherInstance): void {
	const variables: CompanionVariableDefinition[] = []

	variables.push({ variableId: 'connected', name: 'Connected to ScriptLauncher' })

	variables.push({ variableId: 'version', name: 'Version' })
	variables.push({ variableId: 'platform', name: 'Platform / OS' })
	variables.push({ variableId: 'arch', name: 'Architecture' })
	variables.push({ variableId: 'hostname', name: 'Hostname' })

	variables.push({ variableId: 'uptime', name: 'Uptime' })

	if (self.systemInfoVariablesOn === true) {
		//System Info Variables - CPU
		variables.push({ variableId: 'cpu_manufacturer', name: 'CPU Manufacturer' })
		variables.push({ variableId: 'cpu_brand', name: 'CPU Brand' })
		variables.push({ variableId: 'cpu_speed', name: 'CPU Speed' })
		variables.push({ variableId: 'cpu_cores', name: 'CPU Cores' })

		//System Info Variables - CPU Temp
		variables.push({ variableId: 'cpu_temp', name: 'CPU Temp' })

		//System Info Variables - Current Load
		variables.push({ variableId: 'cpu_load_avg', name: 'CPU Avg Load' })
		variables.push({ variableId: 'cpu_load_current', name: 'CPU Current Load' })
		variables.push({ variableId: 'cpu_load_user', name: 'CPU Current Load User' })
		variables.push({ variableId: 'cpu_load_system', name: 'CPU Current Load System' })
		variables.push({ variableId: 'cpu_load_idle', name: 'CPU Current Load Idle' })

		//System Info Variables - Disks
		self.systemInfo.disks = self.systemInfo.disks?.filter((disk) => isRealVolume(disk, self.platform))
		self.systemInfo?.disks?.forEach((disk, index) => {
			const safeId = getSafeDiskId(disk.mount, index)
			const mountLabel = disk.mount

			variables.push({ variableId: `disk_${safeId}_mount`, name: `Disk Mount (${mountLabel})` })
			variables.push({ variableId: `disk_${safeId}_fs`, name: `Disk FS (${mountLabel})` })
			variables.push({ variableId: `disk_${safeId}_type`, name: `Disk Type (${mountLabel})` })
			variables.push({ variableId: `disk_${safeId}_size`, name: `Disk Size (${mountLabel})` })
			variables.push({ variableId: `disk_${safeId}_used`, name: `Disk Used (${mountLabel})` })
			variables.push({ variableId: `disk_${safeId}_available`, name: `Disk Available (${mountLabel})` })
			variables.push({ variableId: `disk_${safeId}_use_percent`, name: `Disk Usage % (${mountLabel})` })
		})

		//System Info Variables - GPU
		variables.push({ variableId: 'gpu_vendor', name: 'GPU Vendor' })
		variables.push({ variableId: 'gpu_model', name: 'GPU Model' })
		variables.push({ variableId: 'gpu_vram', name: 'GPU VRAM' })
		variables.push({ variableId: 'gpu_bus', name: 'GPU Bus' })
		variables.push({ variableId: 'gpu_cores', name: 'GPU Cores' })
		variables.push({ variableId: 'gpu_utilization', name: 'GPU Utilization' })

		//System Info Variables - Memory
		variables.push({ variableId: 'memory_total', name: 'Memory Total' })
		variables.push({ variableId: 'memory_free', name: 'Memory Free' })
		variables.push({ variableId: 'memory_used', name: 'Memory Used' })
		variables.push({ variableId: 'memory_active', name: 'Memory Active' })
		variables.push({ variableId: 'memory_available', name: 'Memory Available' })

		//System Info Variables - Network Interfaces
		self.systemInfo?.networkInterfaces?.forEach((nic) => {
			variables.push({ variableId: `nic_${nic.iface}_iface`, name: `Network Interface ${nic.iface} - iface` })
			variables.push({ variableId: `nic_${nic.iface}_ifaceName`, name: `Network Interface ${nic.iface} - ifaceName` })
			variables.push({ variableId: `nic_${nic.iface}_ip4`, name: `Network Interface ${nic.iface} - ip4` })
			variables.push({ variableId: `nic_${nic.iface}_ip4subnet`, name: `Network Interface ${nic.iface} - ip4subnet` })
			variables.push({ variableId: `nic_${nic.iface}_ip6`, name: `Network Interface ${nic.iface} - ip6` })
			variables.push({ variableId: `nic_${nic.iface}_ip6subnet`, name: `Network Interface ${nic.iface} - ip6subnet` })
			variables.push({ variableId: `nic_${nic.iface}_mac`, name: `Network Interface ${nic.iface} - mac` })
			variables.push({ variableId: `nic_${nic.iface}_internal`, name: `Network Interface ${nic.iface} - internal` })
			variables.push({ variableId: `nic_${nic.iface}_virtual`, name: `Network Interface ${nic.iface} - virtual` })
			variables.push({ variableId: `nic_${nic.iface}_operstate`, name: `Network Interface ${nic.iface} - operstate` })
			variables.push({ variableId: `nic_${nic.iface}_type`, name: `Network Interface ${nic.iface} - type` })
			variables.push({ variableId: `nic_${nic.iface}_duplex`, name: `Network Interface ${nic.iface} - duplex` })
			variables.push({ variableId: `nic_${nic.iface}_mtu`, name: `Network Interface ${nic.iface} - mtu` })
			variables.push({ variableId: `nic_${nic.iface}_speed`, name: `Network Interface ${nic.iface} - speed` })
			variables.push({ variableId: `nic_${nic.iface}_dhcp`, name: `Network Interface ${nic.iface} - dhcp` })

			//stats
			variables.push({ variableId: `nic_${nic.iface}_rx_bytes`, name: `Network Interface ${nic.iface} - rx_bytes` })
			variables.push({ variableId: `nic_${nic.iface}_rx_errors`, name: `Network Interface ${nic.iface} - rx_errors` })

			variables.push({ variableId: `nic_${nic.iface}_tx_bytes`, name: `Network Interface ${nic.iface} - tx_bytes` })
			variables.push({ variableId: `nic_${nic.iface}_tx_errors`, name: `Network Interface ${nic.iface} - tx_errors` })

			//rx/tx rates
			variables.push({ variableId: `nic_${nic.iface}_rx_sec`, name: `Network Interface ${nic.iface} - rx/sec` })
			variables.push({ variableId: `nic_${nic.iface}_tx_sec`, name: `Network Interface ${nic.iface} - tx/sec` })

			variables.push({ variableId: `nic_${nic.iface}_rx_sec_mb`, name: `Network Interface ${nic.iface} - rx/sec mb` })
			variables.push({ variableId: `nic_${nic.iface}_tx_sec_mb`, name: `Network Interface ${nic.iface} - tx/sec mb` })

			//utilization
			variables.push({
				variableId: `nic_${nic.iface}_utilization`,
				name: `Network Interface ${nic.iface} - Utilization`,
			})
		})
	}

	// Add Fonts variable
	if (self.fonts && self.fonts.length > 0) {
		variables.push({
			variableId: 'fonts',
			name: 'Available Fonts',
		})
	}

	self.setVariableDefinitions(variables)
}

export function CheckVariables(self: ScriptLauncherInstance): void {
	const variableValues: CompanionVariableValues = {}

	variableValues.connected = self.connected ? 'Connected' : 'Disconnected'

	self.setVariableValues(variableValues)
}
