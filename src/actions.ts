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

		moveFileBasedOnSize: {
			name: 'Move File(s) Based on Size',
			description:
				"Move a file(s) in a folder based on the file's size. You can specify the threshold size.",
			options: [
				{
					type: 'textinput',
					label: 'Source Folder Path',
					id: 'sourceFolderPath',
					default: '',
					useVariables: true,
				},
				{
					type: 'checkbox',
					label: 'Select File(s) to Move Based on File Extension',
					id: 'selectByExtension',
					default: false,
					tooltip: 'If checked, only files with the specified extension will be considered.',
				},
				{
					type: 'textinput',
					label: 'File Extension',
					id: 'fileExtension',
					default: '.mp4',
					tooltip: 'File extension to filter by (e.g., .txt, .jpg)',
					useVariables: true,
					isVisible: (options) => options.selectByExtension === true, // Only show if selectByExtension is checked
				},
				{
					type: 'checkbox',
					label: 'Select File(s) to Move Based on File Size',
					id: 'selectBySize',
					default: true,
					tooltip: 'If checked, only files great or less than the specified size will be considered for moving.',
				},
				{
					type: 'number',
					label: 'Size Threshold (in MB)',
					id: 'sizeThreshold',
					default: 1000,
					min: 0,
					max: 10000, // Arbitrary max size limit, adjust as needed
					tooltip: 'The size threshold in MB.',
					isVisible: (options) => options.selectBySize === true, // Only show if selectBySize is checked
				},
				{
					type: 'checkbox',
					label: 'Move Files Equal to or Larger than Threshold',
					id: 'moveLargerThanThreshold',
					default: true,
					tooltip: 'If checked, files larger than the specified size will be moved to the selected destination.',
					isVisible: (options) => options.selectBySize === true, // Only show if selectBySize is checked
				},
				{
					type: 'textinput',
					label: 'Destination Folder Path (for Files Larger than Threshold)',
					id: 'destFolderPathLarger',
					default: '',
					useVariables: true,
					isVisible: (options) => (options.moveLargerThanThreshold == true && options.selectBySize == true), // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'checkbox',
					label: 'Select Newest or Oldest File within Size Threshold (for Files Larger than Threshold)',
					id: 'selectNewestOrOldestLarger',
					default: true,
					tooltip: 'If checked, you can choose to move only the newest or oldest file that meets the size threshold. Otherwise all files meeting the criteria will be moved.',
					isVisible: (options) => (options.moveLargerThanThreshold == true && options.selectBySize == true), // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'dropdown',
					label: 'Newest or Oldest File within Size Threshold (for Files Larger than Threshold)',
					id: 'newestOrOldestLarger',
					default: 'newest',
					choices: [
						{ id: 'newest', label: 'Newest File' },
						{ id: 'oldest', label: 'Oldest File' },
					],
					isVisible: (options) => (options.moveLargerThanThreshold == true && options.selectNewestOrOldestLarger === true && options.selectBySize === true), // Only show if selectNewestOrOldestLarger is checked
				},
				{
					type: 'textinput',
					label: 'Destination File Name (for File Larger than Threshold)',
					id: 'fileNameLarger',
					default: '',
					tooltip:
						'The name of the file in the destination folder. You can leave it empty to keep the original name. If you don\t specify a file extension, the original file extension will be kept.',
					useVariables: true,
					isVisible: (options) => (options.moveLargerThanThreshold == true && options.selectNewestOrOldestLarger === true && options.selectBySize === true), // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'checkbox',
					label: 'Move Files Smaller than Threshold',
					id: 'moveSmallerThanThreshold',
					default: true,
					tooltip: 'If checked, files smaller than the specified size will be moved to the selected destination.',
					isVisible: (options) => options.selectBySize === true, // Only show if selectBySize is checked
				},
				{
					type: 'textinput',
					label: 'Destination Folder Path (for Files Smaller than Threshold)',
					id: 'destFolderPathSmaller',
					default: '',
					useVariables: true,
					isVisible: (options) => (options.moveSmallerThanThreshold == true && options.selectBySize === true), // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'checkbox',
					label: 'Select Smallest Newest or Oldest File within Size Threshold',
					id: 'selectNewestOrOldestSmaller',
					default: true,
					tooltip: 'If checked, you can choose to move the newest or oldest file that meets the size threshold.',
					isVisible: (options) => options.moveSmallerThanThreshold === true && options.selectBySize === true, // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'dropdown',
					label: 'Smallest Newest or Oldest File within Size Threshold',
					id: 'newestOrOldestSmaller',
					default: 'newest',
					choices: [
						{ id: 'newest', label: 'Newest File' },
						{ id: 'oldest', label: 'Oldest File' },
					],
					isVisible: (options) => (options.moveSmallerThanThreshold == true && options.selectNewestOrOldestSmaller === true && options.selectBySize === true), // Only show if selectNewestOrOldestLarger is checked
				},
				{
					type: 'textinput',
					label: 'Destination File Name (for File Smaller than Threshold)',
					id: 'fileNameSmaller',
					default: '',
					tooltip:
						'The name of the file in the destination folder. You can leave it empty to keep the original name. If you don\t specify a file extension, the original file extension will be kept.',
					useVariables: true,
					isVisible: (options) => (options.moveSmallerThanThreshold == true && options.selectNewestOrOldestSmaller === true && options.selectBySize === true), // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'textinput',
					label: 'Destination Folder Path',
					id: 'destFolderPath',
					default: '',
					useVariables: true,
					isVisible: (options) => (options.selectBySize === false), // Only show if moveLargerThanThreshold is checked
				},
				
			],
			callback: async (action) => {
				const moveObj: any = {}

				moveObj.sourceFolderPath = await self.parseVariablesInString(String(action.options.sourceFolderPath))

				//File Extension
				const selectByExtension = action.options.selectByExtension ? true : false
				let fileExtension = ''
				if (selectByExtension) {
					fileExtension = await self.parseVariablesInString(String(action.options.fileExtension))
					if (!fileExtension.startsWith('.')) {
						fileExtension = '.' + fileExtension
					}
				}
				moveObj.fileExtension = fileExtension

				//Size Filter
				const selectBySize = action.options.selectBySize ? true : false
				moveObj.selectBySize = selectBySize
				let sizeThreshold = 0
				if (selectBySize) {
					sizeThreshold = Number(action.options.sizeThreshold)
					if (isNaN(sizeThreshold)) {
						sizeThreshold = 1000
					}
					if (sizeThreshold < 0) {
						sizeThreshold = 0
					}
					moveObj.sizeThreshold = sizeThreshold

					const moveLargerThanThreshold = action.options.moveLargerThanThreshold ? true : false
					let destFolderPathLarger = ''
					if (moveLargerThanThreshold) {
						destFolderPathLarger = await self.parseVariablesInString(String(action.options.destFolderPathLarger))
						moveObj.destFolderPathLarger = destFolderPathLarger

						const selectNewestOrOldestLarger = action.options.selectNewestOrOldestLarger ? true : false
						let newestOrOldestLarger = ''
						let fileNameLarger = ''
						if (selectNewestOrOldestLarger) {
							newestOrOldestLarger = String(action.options.newestOrOldestLarger)
							moveObj.newestOrOldestLarger = newestOrOldestLarger
							fileNameLarger = await self.parseVariablesInString(String(action.options.fileNameLarger))
							moveObj.fileNameLarger = fileNameLarger
						}
					}
					
					
					

					const moveSmallerThanThreshold = action.options.moveSmallerThanThreshold ? true : false
					let destFolderPathSmaller = ''
					if (moveSmallerThanThreshold) {
						destFolderPathSmaller = await self.parseVariablesInString(String(action.options.destFolderPathSmaller))
						moveObj.destFolderPathSmaller = destFolderPathSmaller

						const selectNewestOrOldestSmaller = action.options.selectNewestOrOldestSmaller ? true : false
						let newestOrOldestSmaller = ''
						let fileNameSmaller = ''
						if (selectNewestOrOldestSmaller) {
							newestOrOldestSmaller = String(action.options.newestOrOldestSmaller)
							moveObj.newestOrOldestSmaller = newestOrOldestSmaller
							fileNameSmaller = await self.parseVariablesInString(String(action.options.fileNameSmaller))
							moveObj.fileNameSmaller = fileNameSmaller
						}
					}
				}
				else {
					const destFolderPath = await self.parseVariablesInString(String(action.options.destFolderPath))
					moveObj.destFolderPath = destFolderPath
					moveObj.selectBySize = false
				}

				self.socket.emit(
					'moveFileBasedOnSize',
					moveObj,
					self.config.password
				)
			},
		},

		focusApp: {
			name: 'Focus Application or Process',
			description: 'Focus an application or process by providing the name of the application or process.',
			options: [
				{
					type: 'textinput',
					label: 'Application Name',
					id: 'appName',
					default: '',
					tooltip: 'Name of the application or process to focus',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const appName = await self.parseVariablesInString(String(action.options.appName))
				self.socket.emit('focusApp', appName, self.config.password)
			},
		},

		quitApp: {
			name: 'Quit Application or Process',
			description: 'Quit an application or process by providing the name of the application or process.',
			options: [
				{
					type: 'textinput',
					label: 'Application Name',
					id: 'appName',
					default: '',
					tooltip: 'Name of the application or process to quit',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const appName = await self.parseVariablesInString(String(action.options.appName))
				self.socket.emit('quitApp', appName, self.config.password)
			},
		},

		getFonts: {
			name: 'Get Installed Fonts',
			description: 'Retrieve a list of installed fonts on the computer',
			options: [],
			callback: () => {
				self.socket.emit('getFonts', self.config.password)
			},
		},
	})
}
