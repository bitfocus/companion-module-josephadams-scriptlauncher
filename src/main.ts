import { InstanceBase, runEntrypoint, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateVariableDefinitions } from './variables.js'
import { InitConnection, SendCommand, SendExecute } from './api.js'

import type { Socket } from 'socket.io-client'

export class ScriptLauncherInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	socket!: Socket
	connected = false

	constructor(internal: unknown) {
		super(internal)

		this.socket as Socket
		this.connected as boolean
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updateActions() // export actions
		this.updateVariableDefinitions() // export variable definitions

		await this.initConnection()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		await this.initConnection()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	async initConnection(): Promise<void> {
		await InitConnection(this)
	}

	async sendCommand(command: string, args?: string): Promise<void> {
		await SendCommand(this, command, args)
	}

	async sendExecute(executable: string, command: string): Promise<void> {
		await SendExecute(this, executable, command)
	}
}

runEntrypoint(ScriptLauncherInstance, UpgradeScripts)
