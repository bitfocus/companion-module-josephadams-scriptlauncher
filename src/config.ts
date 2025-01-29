import type { SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	ip: string
	port: number
	password: string
	verbose: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module will communicate with Script Launcher, a free program that lets you run scripts/executables remotely. You can download it from <a href="http://github.com/josephdadams/scriptlauncher">here</a>.',
		},
		{
			type: 'textinput',
			id: 'ip',
			width: 4,
			label: 'ScriptLauncher IP Address',
			default: '192.168.0.1',
		},
		{
			type: 'number',
			id: 'port',
			width: 4,
			label: 'ScriptLauncher Port',
			min: 1,
			max: 65535,
			default: 8810,
		},
		{
			type: 'textinput',
			id: 'password',
			width: 4,
			label: 'ScriptLauncher Control Password',
			default: 'admin',
		},
		{
			type: 'static-text',
			id: 'hr1',
			width: 12,
			label: ' ',
			value: '<hr />',
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Enable Verbose Logging',
			default: false,
			width: 4,
		},
	]
}
