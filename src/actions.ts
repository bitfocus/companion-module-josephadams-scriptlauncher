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
			callback: (action) => {
				const delay = Number(action.options.delay)
				self.socket.emit('shutdown', self.config.password, delay.toString())
			},
		},

		shutdown_cancel: {
			name: 'Cancel Shutdown',
			description: 'Cancel a pending shutdown',
			options: [],
			callback: () => {
				self.socket.emit('shutdown_cancel', self.config.password)
			},
		},

		reboot: {
			name: 'Reboot/Restart Computer',
			description: 'Reboot/Restart the computer',
			options: [],
			callback: () => {
				self.socket.emit('reboot', self.config.password)
			},
		},

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
				self.socket.emit('sendAlert', self.config.password, String(action.options.message))
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
				self.socket.emit('execute', executable, command, self.config.password, )
			},
		},
	})
}
