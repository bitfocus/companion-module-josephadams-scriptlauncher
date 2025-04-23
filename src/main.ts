import { InstanceBase, runEntrypoint, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateVariableDefinitions } from './variables.js'
import { InitConnection } from './api.js'

import type { Socket } from 'socket.io-client'

export class ScriptLauncherInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	socket!: Socket
	connected: boolean = false
	systemInfo!: systemInfo
	systemInfoVariablesOn: boolean = false
	fonts: string[] = [] // Array to hold font names

	constructor(internal: unknown) {
		super(internal)

		this.socket as Socket
		this.systemInfo as systemInfo

		this.systemInfo = {
			cpu: {
				manufacturer: '',
				brand: '',
				speed: 0,
				cores: 0,
			},
			currentLoad: {
				avgLoad: 0,
				currentLoad: 0,
				currentLoadUser: 0,
				currentLoadSystem: 0,
				currentLoadIdle: 0,
			},
			memory: {
				total: 0,
				free: 0,
				used: 0,
				active: 0,
				available: 0,
			},
			networkInterfaces: [],
			networkStats: [],
		}
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
}

runEntrypoint(ScriptLauncherInstance, UpgradeScripts)
