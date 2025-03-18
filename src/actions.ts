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

		lock: {
			name: 'Lock Computer',
			description: 'Lock the computer',
			options: [],
			callback: () => {
				self.socket.emit('lock', self.config.password)
			},
		},

		sendAlert: {
			name: 'Send Alert',
			description: 'Send an alert or notification to the computer',
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
					tooltip: 'Path to the executable',
				},
				{
					type: 'textinput',
					label: 'Arguments',
					id: 'args',
					default: '',
					tooltip: 'Arguments to the executable',
				},
				{
					type: 'textinput',
					label: 'Input',
					id: 'stdin',
					default: '',
					tooltip: 'Input to write to STDIN',
				},
			],
			callback: async (action) => {
				const executable = await self.parseVariablesInString(String(action.options.executable))
				const args = await self.parseVariablesInString(String(action.options.args))
				const stdin = await self.parseVariablesInString(String(action.options.stdin))
				self.socket.emit('execute', executable, args, stdin, self.config.password)
			},
		},

		stopSystemInfo: {
			name: 'Stop System Information',
			description: 'Stop the system information service',
			options: [],
			callback: () => {
				self.socket.emit('stopSystemInfo')
				self.systemInfoVariablesOn = false
				self.updateVariableDefinitions()
			},
		},

		startSystemInfo: {
			name: 'Start System Information',
			description: 'Start the system information service',
			options: [],
			callback: () => {
				self.socket.emit('startSystemInfo')
				self.systemInfoVariablesOn = true
				self.updateVariableDefinitions()
			},
		},

		moveFile: {
			name: 'Rename or Move File',
			description: 'Rename or Move a File by providing the full source path and the new full destination path.',
			options: [
				{
					type: 'textinput',
					label: 'Source Path',
					id: 'sourcePath',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Destination Path',
					id: 'destPath',
					default: '',
					useVariables: true,
				},
				{
					type: 'checkbox',
					label: 'Copy Only',
					id: 'copyOnly',
					default: false,
					tooltip: 'If checked, the file will only be copied instead of moved',
				},
			],
			callback: async (action) => {
				const sourcePath = await self.parseVariablesInString(String(action.options.sourcePath))
				const destPath = await self.parseVariablesInString(String(action.options.destPath))
				const copyOnly = action.options.copyOnly ? true : false
				self.socket.emit('moveFile', sourcePath, destPath, copyOnly, self.config.password)
			},
		},

		moveDatedFileInFolder: {
			name: 'Move Dated File in Folder',
			description:
				"Move a file in a folder based on the file's creation date. You can select the newest or oldest file.",
			options: [
				{
					type: 'textinput',
					label: 'Source Folder Path',
					id: 'sourceFolderPath',
					default: '',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Newest or Oldest File',
					id: 'newestOrOldest',
					default: 'newest',
					choices: [
						{ id: 'newest', label: 'Newest File' },
						{ id: 'oldest', label: 'Oldest File' },
					],
				},
				{
					type: 'textinput',
					label: 'Destination Folder Path',
					id: 'destFolderPath',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Destination File Name',
					id: 'fileName',
					default: '',
					tooltip:
						'The name of the file in the destination folder. You can leave it empty to keep the original name. If you don\t specify a file extension, the original file extension will be kept.',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const sourceFolderPath = await self.parseVariablesInString(String(action.options.sourceFolderPath))
				const newestOrOldest = String(action.options.newestOrOldest)
				const destFolderPath = await self.parseVariablesInString(String(action.options.destFolderPath))
				const fileName = await self.parseVariablesInString(String(action.options.fileName))
				self.socket.emit(
					'moveDatedFileInFolder',
					sourceFolderPath,
					newestOrOldest,
					destFolderPath,
					fileName,
					self.config.password,
				)
			},
		},

		moveDatedFileInFolderWithExtension: {
			name: 'Move Dated File in Folder (Specify Extension)',
			description:
				"Move a file in a folder based on the file's creation date. You can select the newest or oldest file.",
			options: [
				{
					type: 'textinput',
					label: 'Source Folder Path',
					id: 'sourceFolderPath',
					default: '',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Newest or Oldest File',
					id: 'newestOrOldest',
					default: 'newest',
					choices: [
						{ id: 'newest', label: 'Newest File' },
						{ id: 'oldest', label: 'Oldest File' },
					],
				},
				{
					type: 'textinput',
					label: 'File Extension',
					id: 'fileExtension',
					default: '.mp4',
					tooltip: 'File extension to filter by (e.g., .txt, .jpg)',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Destination Folder Path',
					id: 'destFolderPath',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Destination File Name',
					id: 'fileName',
					default: '',
					tooltip:
						'The name of the file in the destination folder. You can leave it empty to keep the original name. If you don\t specify a file extension, the original file extension will be kept.',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const sourceFolderPath = await self.parseVariablesInString(String(action.options.sourceFolderPath))
				const newestOrOldest = String(action.options.newestOrOldest)
				let fileExtension = await self.parseVariablesInString(String(action.options.fileExtension))
				//make sure extension starts with a dot
				if (!fileExtension.startsWith('.')) {
					fileExtension = '.' + fileExtension
				}
				const destFolderPath = await self.parseVariablesInString(String(action.options.destFolderPath))
				const fileName = await self.parseVariablesInString(String(action.options.fileName))
				self.socket.emit(
					'moveDatedFileInFolderWithExtension',
					sourceFolderPath,
					newestOrOldest,
					fileExtension,
					destFolderPath,
					fileName,
					self.config.password,
				)
			},
		},
	})
}
