import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'

import type { ScriptLauncherInstance } from './main.js'

export function UpdateVariableDefinitions(self: ScriptLauncherInstance): void {
	const variables: CompanionVariableDefinition[] = []

	variables.push({ variableId: 'connected', name: 'Connected to ScriptLauncher' })

	//System Info Variables - CPU
	variables.push({ variableId: 'cpu_manufacturer', name: 'CPU Manufacturer' })
	variables.push({ variableId: 'cpu_brand', name: 'CPU Brand' })
	variables.push({ variableId: 'cpu_speed', name: 'CPU Speed' })
	variables.push({ variableId: 'cpu_cores', name: 'CPU Cores' })

	//System Info Variables - Current Load
	variables.push({ variableId: 'cpu_load_avg', name: 'CPU Avg Load' })
	variables.push({ variableId: 'cpu_load_current', name: 'CPU Current Load' })
	variables.push({ variableId: 'cpu_load_user', name: 'CPU Current Load User' })
	variables.push({ variableId: 'cpu_load_system', name: 'CPU Current Load System' })
	variables.push({ variableId: 'cpu_load_idle', name: 'CPU Current Load Idle' })

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
	})

	self.setVariableDefinitions(variables)
}

export function CheckVariables(self: ScriptLauncherInstance): void {
	const variableValues: CompanionVariableValues = {}

	variableValues.connected = self.connected ? 'Connected' : 'Disconnected'

	self.setVariableValues(variableValues)
}
