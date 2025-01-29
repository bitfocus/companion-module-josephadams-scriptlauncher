import { InstanceStatus } from '@companion-module/base'
import type { ScriptLauncherInstance } from './main.js'

import { CheckVariables } from './variables.js'

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
		self.log('info', `Command result: ${result}`)
	})
}

export async function SendCommand(self: ScriptLauncherInstance, command: string, args?: string): Promise<void> {
	const password = self.config.password

	if (self.config.verbose) {
		self.log('debug', `Sending command: ${command}`)
	}

	if (args) {
		self.socket.emit(command, password, args)
		return
	}

	self.socket.emit(command, password)
}

export async function SendExecute(self: ScriptLauncherInstance, executable: string, command: string): Promise<void> {
	const password = self.config.password

	if (self.config.verbose) {
		self.log('debug', `Sending execute command: ${executable} ${command}`)
	}

	self.socket.emit('execute', executable, command, password)
}
