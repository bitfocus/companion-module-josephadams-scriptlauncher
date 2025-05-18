import { ScriptLauncherInstance } from './main.js'

import { emitAppleScript, emitShellCommand } from './api.js'

const MODIFIERS = [
	{ id: 'control', label: 'Control' },
	{ id: 'alt', label: 'Alt' },
	{ id: 'shift', label: 'Shift' },
	{ id: 'command', label: 'Command' },
]

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
				const obj = {} as any
				obj.command = 'shutdown'
				obj.password = self.config.password
				obj.delay = delay
				self.socket.emit('command', obj)
			},
		},

		shutdown_cancel: {
			name: 'Cancel Shutdown',
			description: 'Cancel a pending shutdown',
			options: [],
			callback: () => {
				const obj = {} as any
				obj.command = 'shutdown_cancel'
				obj.password = self.config.password
				self.socket.emit('command', obj)
			},
		},

		reboot: {
			name: 'Reboot/Restart Computer',
			description: 'Reboot/Restart the computer',
			options: [],
			callback: () => {
				const obj = {} as any
				obj.command = 'reboot'
				obj.password = self.config.password
				self.socket.emit('command', obj)
			},
		},

		lock: {
			name: 'Lock Computer',
			description: 'Lock the computer',
			options: [],
			callback: () => {
				const obj = {} as any
				obj.command = 'lock'
				obj.password = self.config.password
				self.socket.emit('command', obj)
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
				const obj = {} as any
				obj.command = 'sendAlert'
				obj.password = self.config.password
				obj.message = action.options.message
				self.socket.emit('command', obj)
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

				//take the args and split them into an array by spaces, and if there aren't any, just create an empty array
				let argsArray: string[] = []
				if (args.length > 0) {
					argsArray = args.split(' ')
				}

				const obj = {} as any
				obj.command = 'runScript'
				obj.password = self.config.password
				obj.executable = executable
				obj.args = argsArray
				obj.stdin = stdin
				self.socket.emit('command', obj)
			},
		},

		stopSystemInfo: {
			name: 'Stop System Information',
			description: 'Stop the system information service',
			options: [],
			callback: () => {
				const obj = {} as any
				obj.command = 'stopSystemInfo'
				obj.password = self.config.password
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
				const obj = {} as any
				obj.command = 'startSystemInfo'
				obj.password = self.config.password
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

				const obj = {} as any
				obj.command = 'moveFile'
				obj.password = self.config.password
				obj.sourcePath = sourcePath
				obj.destPath = destPath
				obj.copyOnly = copyOnly
				self.socket.emit('command', obj)
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

				const obj = {} as any
				obj.command = 'moveDatedFileInFolder'
				obj.password = self.config.password
				obj.sourceFolderPath = sourceFolderPath
				obj.newestOrOldest = newestOrOldest
				obj.destFolderPath = destFolderPath
				obj.fileName = fileName

				self.socket.emit('command', obj)
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

				const obj = {} as any
				obj.command = 'moveDatedFileInFolderWithExtension'
				obj.password = self.config.password
				obj.sourceFolderPath = sourceFolderPath
				obj.newestOrOldest = newestOrOldest
				obj.fileExtension = fileExtension
				obj.destFolderPath = destFolderPath
				obj.fileName = fileName

				self.socket.emit('command', obj)
			},
		},

		moveFileBasedOnSize: {
			name: 'Move File(s) Based on Size',
			description: "Move a file(s) in a folder based on the file's size. You can specify the threshold size.",
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
					isVisible: (options) => options.moveLargerThanThreshold == true && options.selectBySize == true, // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'checkbox',
					label: 'Select Newest or Oldest File within Size Threshold (for Files Larger than Threshold)',
					id: 'selectNewestOrOldestLarger',
					default: true,
					tooltip:
						'If checked, you can choose to move only the newest or oldest file that meets the size threshold. Otherwise all files meeting the criteria will be moved.',
					isVisible: (options) => options.moveLargerThanThreshold == true && options.selectBySize == true, // Only show if moveLargerThanThreshold is checked
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
					isVisible: (options) =>
						options.moveLargerThanThreshold == true &&
						options.selectNewestOrOldestLarger === true &&
						options.selectBySize === true, // Only show if selectNewestOrOldestLarger is checked
				},
				{
					type: 'textinput',
					label: 'Destination File Name (for File Larger than Threshold)',
					id: 'fileNameLarger',
					default: '',
					tooltip:
						'The name of the file in the destination folder. You can leave it empty to keep the original name. If you don\t specify a file extension, the original file extension will be kept.',
					useVariables: true,
					isVisible: (options) =>
						options.moveLargerThanThreshold == true &&
						options.selectNewestOrOldestLarger === true &&
						options.selectBySize === true, // Only show if moveLargerThanThreshold is checked
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
					isVisible: (options) => options.moveSmallerThanThreshold == true && options.selectBySize === true, // Only show if moveLargerThanThreshold is checked
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
					isVisible: (options) =>
						options.moveSmallerThanThreshold == true &&
						options.selectNewestOrOldestSmaller === true &&
						options.selectBySize === true, // Only show if selectNewestOrOldestLarger is checked
				},
				{
					type: 'textinput',
					label: 'Destination File Name (for File Smaller than Threshold)',
					id: 'fileNameSmaller',
					default: '',
					tooltip:
						'The name of the file in the destination folder. You can leave it empty to keep the original name. If you don\t specify a file extension, the original file extension will be kept.',
					useVariables: true,
					isVisible: (options) =>
						options.moveSmallerThanThreshold == true &&
						options.selectNewestOrOldestSmaller === true &&
						options.selectBySize === true, // Only show if moveLargerThanThreshold is checked
				},
				{
					type: 'textinput',
					label: 'Destination Folder Path',
					id: 'destFolderPath',
					default: '',
					useVariables: true,
					isVisible: (options) => options.selectBySize === false, // Only show if moveLargerThanThreshold is checked
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
				} else {
					const destFolderPath = await self.parseVariablesInString(String(action.options.destFolderPath))
					moveObj.destFolderPath = destFolderPath
					moveObj.selectBySize = false
				}

				let obj = {} as any
				obj.command = 'moveFileBasedOnSize'
				obj.password = self.config.password
				obj = { ...obj, ...moveObj }

				self.socket.emit('command', obj)
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

				const obj = {} as any
				obj.command = 'focusApp'
				obj.password = self.config.password
				obj.appName = appName
				self.socket.emit('command', obj)
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

				const obj = {} as any
				obj.command = 'quitApp'
				obj.password = self.config.password
				obj.appName = appName
				self.socket.emit('command', obj)
			},
		},

		getFonts: {
			name: 'Get Installed Fonts',
			description: 'Retrieve a list of installed fonts on the computer',
			options: [],
			callback: () => {
				const obj = {} as any
				obj.command = 'getFonts'
				obj.password = self.config.password
				self.socket.emit('command', obj)
			},
		},

		keyPress: {
			name: 'Send Key Press',
			options: [
				{
					type: 'textinput',
					label: 'Key to tap',
					id: 'key',
					default: 'a',
				},
				{
					type: 'multidropdown',
					label: 'Modifiers',
					id: 'modifiers',
					default: [MODIFIERS[0].id],
					choices: MODIFIERS,
					minSelection: 0,
				},
			],
			callback: (action) => {
				const obj = {} as any
				obj.command = 'sendInput'
				obj.password = self.config.password
				obj.type = 'keyPress'
				obj.key = action.options.key
				obj.modifiers = action.options.modifiers

				self.socket.emit('command', obj)
			},
		},

		mouseSetPosition: {
			name: 'Move Mouse',
			options: [
				{
					type: 'number',
					label: 'X Position',
					id: 'x',
					default: 100,
					min: 0,
					max: 1920, // Adjust based on expected screen width
				},
				{
					type: 'number',
					label: 'Y Position',
					id: 'y',
					default: 100,
					min: 0,
					max: 1080, // Adjust based on expected screen height
				},
			],
			callback: (action) => {
				const obj = {} as any
				obj.command = 'sendInput'
				obj.password = self.config.password
				obj.type = 'mouseSetPosition'
				obj.x = action.options.x
				obj.y = action.options.y

				self.socket.emit('command', obj)
			},
		},

		mouseClick: {
			name: 'Click Mouse',
			options: [
				{
					type: 'dropdown',
					label: 'Button',
					id: 'button',
					default: 'left',
					choices: [
						{ id: 'left', label: 'Left' },
						{ id: 'right', label: 'Right' },
						{ id: 'middle', label: 'Middle' },
					],
				},
				{
					type: 'checkbox',
					label: 'Double Click',
					id: 'double',
					default: false,
				},
			],
			callback: (action) => {
				const obj = {} as any
				obj.command = 'sendInput'
				obj.password = self.config.password
				obj.type = 'mouseClick'
				obj.button = action.options.button
				obj.double = action.options.double ? true : false

				self.socket.emit('command', obj)
			},
		},

		mouseClickHold: {
			name: 'Hold Mouse Button',
			options: [
				{
					type: 'dropdown',
					label: 'Button',
					id: 'button',
					default: 'left',
					choices: [
						{ id: 'left', label: 'Left' },
						{ id: 'right', label: 'Right' },
					],
				},
			],
			callback: (action) => {
				const obj = {} as any
				obj.command = 'sendInput'
				obj.password = self.config.password
				obj.type = 'mouseClickHold'
				obj.button = action.options.button
				self.socket.emit('command', obj)
			},
		},

		mouseClickRelease: {
			name: 'Release Mouse Button',
			options: [
				{
					type: 'dropdown',
					label: 'Button',
					id: 'button',
					default: 'left',
					choices: [
						{ id: 'left', label: 'Left' },
						{ id: 'right', label: 'Right' },
					],
				},
			],
			callback: (action) => {
				const obj = {} as any
				obj.command = 'sendInput'
				obj.password = self.config.password
				obj.type = 'mouseClickRelease'
				obj.button = action.options.button
				self.socket.emit('command', obj)
			},
		},

		mouseScroll: {
			name: 'Scroll Mouse',
			options: [
				{
					type: 'number',
					label: 'Scroll X',
					id: 'x',
					default: 0,
					min: -1000,
					max: 1000,
				},
				{
					type: 'number',
					label: 'Scroll Y',
					id: 'y',
					default: 100,
					min: -1000,
					max: 1000,
				},
			],
			callback: (action) => {
				const obj = {} as any
				obj.command = 'sendInput'
				obj.password = self.config.password
				obj.type = 'mouseScroll'
				obj.x = action.options.x
				obj.y = action.options.y
				self.socket.emit('command', obj)
			},
		},

		//Mac Only Actions
		macRunAppleScript: {
			name: 'Mac: Run AppleScript',
			description: 'Run an AppleScript command',
			options: [
				{
					type: 'textinput',
					label: 'AppleScript Command',
					id: 'script',
					default: '',
					tooltip: 'The AppleScript command to run',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const script = await self.parseVariablesInString(String(action.options.script))

				emitAppleScript(self, script)
			},
		},

		macSetWindowBounds: {
			name: 'Mac: Set Window Bounds',
			description: 'Set the bounds of a window by providing the name of the application and the desired bounds.',
			options: [
				{
					type: 'textinput',
					label: 'Application Name',
					id: 'appName',
					default: '',
					tooltip: 'Name of the application to set bounds for',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'X Position',
					id: 'x',
					default: '0',
					tooltip: 'X position of the window',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Y Position',
					id: 'y',
					default: '0',
					tooltip: 'Y position of the window',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Width',
					id: 'width',
					default: '800',
					tooltip: 'Width of the window',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Height',
					id: 'height',
					default: '600',
					tooltip: 'Height of the window',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const appName = await self.parseVariablesInString(String(action.options.appName))
				const x = await self.parseVariablesInString(String(action.options.x || '0'))
				const y = await self.parseVariablesInString(String(action.options.y || '0'))
				const width = await self.parseVariablesInString(String(action.options.width || '800'))
				const height = await self.parseVariablesInString(String(action.options.height || '600'))

				const applescript = `tell application "${appName}" to set bounds of front window to {${x}, ${y}, ${width}, ${height}}`

				emitAppleScript(self, applescript)
			},
		},

		macSpeakText: {
			name: 'Mac: Speak Text',
			description: 'Speak a text string using the Mac OS X text-to-speech engine',
			options: [
				{
					type: 'textinput',
					label: 'Text to Speak',
					id: 'text',
					default: 'The big brown fox jumps over the lazy dog.',
					tooltip: 'The text to speak',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Voice',
					id: 'voice',
					tooltip: 'The voice to use for speech (e.g., Alex, Victoria)',
					default: 'Alex',
					choices: [
						{ id: 'Alex', label: 'Alex (default)' },
						{ id: 'Alice', label: 'Alice (Italian)' },
						{ id: 'Alva', label: 'Alva (Swedish)' },
						{ id: 'Amelie', label: 'Amelie (French - Canada)' },
						{ id: 'Anna', label: 'Anna (German)' },
						{ id: 'Carmit', label: 'Carmit (Hebrew)' },
						{ id: 'Damayanti', label: 'Damayanti (Indonesian)' },
						{ id: 'Daniel', label: 'Daniel (British English)' },
						{ id: 'Diego', label: 'Diego (Spanish - Latin America)' },
						{ id: 'Ellen', label: 'Ellen (Dutch)' },
						{ id: 'Fiona', label: 'Fiona (Scottish English)' },
						{ id: 'Fred', label: 'Fred (Classic robot voice)' },
						{ id: 'Ioana', label: 'Ioana (Romanian)' },
						{ id: 'Joana', label: 'Joana (Portuguese - Portugal)' },
						{ id: 'Karen', label: 'Karen (Australian English)' },
						{ id: 'Kanya', label: 'Kanya (Thai)' },
						{ id: 'Kyoko', label: 'Kyoko (Japanese)' },
						{ id: 'Laura', label: 'Laura (Spanish - Spain)' },
						{ id: 'Lekha', label: 'Lekha (Hindi)' },
						{ id: 'Luciana', label: 'Luciana (Italian - Female)' },
						{ id: 'Maged', label: 'Maged (Arabic)' },
						{ id: 'Mariska', label: 'Mariska (Hungarian)' },
						{ id: 'Mei-Jia', label: 'Mei-Jia (Chinese - Taiwan)' },
						{ id: 'Melina', label: 'Melina (Greek)' },
						{ id: 'Milena', label: 'Milena (Russian)' },
						{ id: 'Moira', label: 'Moira (Irish English)' },
						{ id: 'Monica', label: 'Monica (Spanish - Spain)' },
						{ id: 'Nora', label: 'Nora (Norwegian)' },
						{ id: 'Paulina', label: 'Paulina (Spanish - Mexico)' },
						{ id: 'Samantha', label: 'Samantha (US English Female)' },
						{ id: 'Sara', label: 'Sara (Danish)' },
						{ id: 'Satu', label: 'Satu (Finnish)' },
						{ id: 'Sin-ji', label: 'Sin-ji (Cantonese)' },
						{ id: 'Tessa', label: 'Tessa (South African English)' },
						{ id: 'Thomas', label: 'Thomas (French)' },
						{ id: 'Ting-Ting', label: 'Ting-Ting (Chinese - China)' },
						{ id: 'Veena', label: 'Veena (Indian English)' },
						{ id: 'Victoria', label: 'Victoria (US English Female)' },
						{ id: 'Xander', label: 'Xander (Dutch - Belgium)' },
						{ id: 'Yelda', label: 'Yelda (Turkish)' },
						{ id: 'Yuna', label: 'Yuna (Korean)' },
						{ id: 'Zosia', label: 'Zosia (Polish)' },
						{ id: 'Zuzana', label: 'Zuzana (Czech)' },
					],
				},
				{
					type: 'textinput',
					label: 'Rate',
					id: 'rate',
					default: '200',
					tooltip: 'The rate of speech (words per minute)',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Volume',
					id: 'volume',
					default: '100',
					tooltip: 'The volume level (0-100)',
					useVariables: true,
				},
				{
					type: 'checkbox',
					label: 'Use System Default Voice',
					id: 'useSystemDefault',
					default: false,
					tooltip: 'If checked, the system default voice will be used instead of the specified voice',
				},
			],
			callback: async (action) => {
				let text = await self.parseVariablesInString(String(action.options.text))
				let voice = await self.parseVariablesInString(String(action.options.voice))
				let rate = await self.parseVariablesInString(String(action.options.rate))
				let volume = await self.parseVariablesInString(String(action.options.volume))
				const useSystemDefault = action.options.useSystemDefault ? true : false

				let executable = `say`

				//remove any quotes from the text
				text = text.replace(/"/g, '')
				//remove any quotes from the voice
				voice = voice.replace(/"/g, '')
				//remove any quotes from the rate
				rate = rate.replace(/"/g, '')
				//remove any quotes from the volume
				volume = volume.replace(/"/g, '')

				const args = [text]

				if (!useSystemDefault) {
					args.push(`-v`)
					args.push(`${voice}`)
					args.push(`-r`)
					args.push(`${rate}`)
					args.push(`-a`)
					args.push(`${volume}`)
				}

				const stdin = ''

				const obj = {} as any
				obj.command = 'runScript'
				obj.password = self.config.password
				obj.executable = executable
				obj.args = args
				obj.stdin = stdin

				self.socket.emit('command', obj)
			},
		},

		macMinimizeFrontWindow: {
			name: 'Mac: Minimize Front Window',
			description: 'Minimizes the frontmost application window.',
			options: [],
			callback: async () => {
				emitAppleScript(self, 'tell application "System Events" to keystroke "m" using command down')
			},
		},

		macHideAllApps: {
			name: 'Mac: Hide All Applications',
			description: 'Simulates ⌥ + ⌘ + H to hide all but the front app.',
			options: [],
			callback: async () => {
				emitAppleScript(self, 'tell application "System Events" to keystroke "h" using {command down, option down}')
			},
		},

		macQuitAllAppsExceptFinder: {
			name: 'Mac: Quit All Apps Except Finder',
			description: 'Loops through open apps and quits them, skipping Finder.',
			options: [],
			callback: async () => {
				const script = `tell application \"System Events\"
				repeat with p in (every process where background only is false and name is not \"Finder\")
					try
						tell application (name of p) to quit
					end try
				end repeat
			end tell`
				emitAppleScript(self, script)
			},
		},

		macMuteToggle: {
			name: 'Mac: Toggle Mute',
			description: 'Toggles the mute state of the system output volume.',
			options: [],
			callback: async () => {
				emitAppleScript(self, 'set volume output muted not (output muted of (get volume settings))')
			},
		},

		macSetVolumeLevel: {
			name: 'Mac: Set Volume Level',
			description: 'Sets the system output volume to a specific level (0–100).',
			options: [
				{
					type: 'number',
					label: 'Volume Level',
					id: 'level',
					default: 50,
					min: 0,
					max: 100,
				},
			],
			callback: async (action) => {
				emitAppleScript(self, `set volume output volume ${action.options.level}`)
			},
		},

		macVolumeUp: {
			name: 'Mac: Volume Up',
			description: 'Increases the system volume.',
			options: [
				{
					type: 'number',
					label: 'Volume Increment',
					id: 'increment',
					default: 10,
					min: 1,
					max: 100,
					tooltip: 'Volume increment (1-100)',
				},
			],
			callback: async (action) => {
				emitAppleScript(
					self,
					`set volume output volume ((output volume of (get volume settings)) + ${action.options.increment})`,
				)
			},
		},

		macVolumeDown: {
			name: 'Mac: Volume Down',
			description: 'Decreases the system volume slightly.',
			options: [
				{
					type: 'number',
					label: 'Volume Decrement',
					id: 'decrement',
					default: 10,
					min: 1,
					max: 100,
					tooltip: 'Volume decrement (1-100)',
				},
			],
			callback: async (action) => {
				emitAppleScript(
					self,
					`set volume output volume ((output volume of (get volume settings)) - ${action.options.decrement})`,
				)
			},
		},

		macSleep: {
			name: 'Mac: Sleep Computer',
			description: 'Puts the Mac to sleep immediately.',
			options: [],
			callback: async () => {
				emitAppleScript(self, 'tell application "System Events" to sleep')
			},
		},

		macCreateNote: {
			name: 'Mac: Create Note',
			description: 'Creates a new note in the Notes app with custom title and body.',
			options: [
				{ id: 'title', type: 'textinput', label: 'Note Title', default: 'From ScriptLauncher' },
				{ id: 'body', type: 'textinput', label: 'Note Body', default: 'Hello world!' },
			],
			callback: async (action) => {
				const title = await self.parseVariablesInString(String(action.options.title) || '')
				const body = await self.parseVariablesInString(String(action.options.body) || '')
				emitAppleScript(
					self,
					`tell application \"Notes\" to make new note at folder \"Notes\" with properties {name:\"${title}\", body:\"${body}\"}`,
				)
			},
		},

		macOpenURL: {
			name: 'Mac: Open URL',
			description: 'Opens a URL in the default web browser.',
			options: [
				{
					type: 'textinput',
					id: 'url',
					label: 'URL',
					default: 'https://google.com',
					tooltip: 'The URL to open',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const url = await self.parseVariablesInString(String(action.options.url) || '')
				emitShellCommand(self, `open "${url}"`)
			},
		},

		macToggleDarkMode: {
			name: 'Mac: Toggle Dark Mode',
			description: 'Toggles system dark/light appearance.',
			options: [],
			callback: async () => {
				emitAppleScript(
					self,
					'tell application \"System Events\" to tell appearance preferences to set dark mode to not dark mode',
				)
			},
		},

		macCaptureScreenshot: {
			name: 'Mac: Capture Screenshot',
			description: 'Take a screenshot and save it to the specified location.',
			options: [
				{
					type: 'textinput',
					label: 'Screenshot File Name',
					id: 'fileName',
					default: '~/Desktop/screenshot.png',
					tooltip: 'The name of the screenshot file (default: ~/Desktop/screenshot.png)',
					useVariables: true,
				},
				{
					type: 'checkbox',
					label: 'Supress Sounds',
					id: 'suppressSounds',
					default: true,
					tooltip: 'If checked, suppresses the camera shutter sound when taking a screenshot.',
				},
				{
					type: 'dropdown',
					label: 'Capture Type',
					id: 'captureType',
					default: 'screen',
					tooltip: 'Capture type (screen, window, selection)',
					choices: [
						{ id: 'screen', label: 'Entire Screen' },
						{ id: 'selection', label: 'Draw a Selection' },
						{ id: 'region', label: 'Region' },
					],
				},
				//region specific options x, y, width, height
				{
					type: 'textinput',
					label: 'X Position',
					id: 'x',
					default: '0',
					tooltip: 'X position of the region (only for region capture)',
					useVariables: true,
					isVisible: (options) => options.captureType === 'region', // Only show if captureType is region
				},
				{
					type: 'textinput',
					label: 'Y Position',
					id: 'y',
					default: '0',
					tooltip: 'Y position of the region (only for region capture)',
					useVariables: true,
					isVisible: (options) => options.captureType === 'region', // Only show if captureType is region
				},
				{
					type: 'textinput',
					label: 'Width',
					id: 'width',
					default: '1920',
					tooltip: 'Width of the region (only for region capture)',
					useVariables: true,
					isVisible: (options) => options.captureType === 'region', // Only show if captureType is region
				},
				{
					type: 'textinput',
					label: 'Height',
					id: 'height',
					default: '1080',
					tooltip: 'Height of the region (only for region capture)',
					useVariables: true,
					isVisible: (options) => options.captureType === 'region', // Only show if captureType is region
				},
			],
			callback: async (action) => {
				const fileName = await self.parseVariablesInString(
					String(action.options.fileName || '~/Desktop/screenshot.png'),
				)

				const suppressSounds = action.options.suppressSounds === true
				const captureType = String(action.options.captureType)

				let captureCommand = 'screencapture '
				if (suppressSounds) {
					captureCommand += '-x '
				}

				switch (captureType) {
					case 'screen':
						// full screen, no extra flags needed
						break

					case 'selection':
						captureCommand += '-i '
						break

					case 'region': {
						const x = await self.parseVariablesInString(String(action.options.x || '0'))
						const y = await self.parseVariablesInString(String(action.options.y || '0'))
						const width = await self.parseVariablesInString(String(action.options.width || '1920'))
						const height = await self.parseVariablesInString(String(action.options.height || '1080'))
						captureCommand += `-R${x},${y},${width},${height} `
						break
					}

					default:
						break
				}

				captureCommand += `"${fileName}"`
				emitShellCommand(self, captureCommand)
			},
		},

		macKillDock: {
			name: 'Mac: Restart Dock',
			description: 'Restarts the Dock application.',
			options: [],
			callback: async () => {
				emitShellCommand(self, 'killall Dock')
			}
		},
		macKillFinder: {
			name: 'Mac: Restart Finder',
			description: 'Restarts the Finder application.',
			options: [],
			callback: async () => {
				emitShellCommand(self, 'killall Finder')
			}
		},
		macKillSystemUIServer: {
			name: 'Mac: Restart SystemUIServer (Menu Bar)',
			description: 'Restarts the SystemUIServer application.',
			options: [],
			callback: async () => {
				emitShellCommand(self, 'killall SystemUIServer')
			}
		},
		macForceKillApp: {
			name: 'Mac: Force Kill Application',
			description: 'Force kills an application by name.',
			options: [
				{
					type: 'textinput',
					label: 'Application Name',
					id: 'appName',
					default: '',
					tooltip: 'Name of the application to force kill',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const appName = await self.parseVariablesInString(String(action.options.appName))
				if (appName.trim()) {
					emitShellCommand(self, `killall "${appName}"`)
				} else {
					self.log('warn', 'No application name provided to kill')
				}
			}
		},
		macKillCoreAudio: {
			name: 'Mac: Restart CoreAudio',
			description: 'Restarts the CoreAudio service.',
			options: [],
			callback: async () => {
				emitShellCommand(self, 'sudo killall coreaudiod')
			}
		},
		macLogout: {
			name: 'Mac: Logout',
			description: 'Logs out the current user.',
			options: [],
			callback: async () => {
				emitShellCommand(self, 'killall loginwindow')
			}
		},
	})
}
