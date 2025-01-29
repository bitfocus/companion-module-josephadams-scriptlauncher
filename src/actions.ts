import type { ScriptLauncherInstance } from './main.js'

export function UpdateActions(self: ScriptLauncherInstance): void {
	self.setActionDefinitions({
		shutdown: {
			name: 'Shutdown Computer',
			description: 'Shutdown the computer',
			options: [
				{
					type: 'number',
					label: 'Delay (in minutes)',
					id: 'delay',
					min: 0,
					max: 60,
					default: 0,
				},
			],
			callback: () => {
				self.sendCommand('shutdown')
			},
		},

		reboot: {
			name: 'Reboot/Restart Computer',
			description: 'Reboot/Restart the computer',
			options: [],
			callback: () => {
				self.sendCommand('reboot')
			},
		},

		/*getSystemInfo: {
			name: 'Get System Info',
			description: 'Get system information',
			options: [],
			callback: () => {
				self.sendCommand('getSystemInfo')
			},
		},

		checkDiskSpace: {
			name: 'Check Disk Space',
			description: 'Check disk space',
			options: [],
			callback: () => {
				self.sendCommand('checkDiskSpace')
			},
		},

		listProcesses: {
			name: 'List Processes',
			description: 'List processes',
			options: [],
			callback: () => {
				self.sendCommand('listProcesses')
			},
		},

		checkSystemLoad: {
			name: 'Check System Load',
			description: 'Check system load',
			options: [],
			callback: () => {
				self.sendCommand('checkSystemLoad')
			},
		},*/

		sendAlert: {
			name: 'Send Alert',
			description: 'Send an alert',
			options: [
				{
					type: 'textinput',
					label: 'Message',
					id: 'message',
					default: '',
				},
			],
			callback: (action) => {
				self.sendCommand('sendAlert', String(action.options.message))
			},
		},

		executeCustomCommand: {
			name: 'Execute Custom Command',
			description: 'Execute a custom command',
			options: [
				{
					type: 'textinput',
					label: 'Executable',
					id: 'executable',
					default: '',
					tooltip: 'Path to the executable like node, python, ps, etc.',
				},
				{
					type: 'textinput',
					label: 'Command',
					id: 'command',
					default: '',
					tooltip: 'Command to execute',
				},
			],
			callback: async (action) => {
				const executable = await self.parseVariablesInString(String(action.options.executable))
				const command = await self.parseVariablesInString(String(action.options.command))
				self.sendExecute(executable, command)
			},
		},
	})
}
