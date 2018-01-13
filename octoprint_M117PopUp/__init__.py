# coding=utf-8

import octoprint.plugin
import re

class M117PopUp(octoprint.plugin.AssetPlugin,
				octoprint.plugin.TemplatePlugin,
                octoprint.plugin.SettingsPlugin):
				
	def AlertM117(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
		if gcode and cmd.startswith("M117"):
			self._plugin_manager.send_plugin_message(self._identifier, dict(type="popup", msg=re.sub(r'^M117\s?', '', cmd)))
			return
	
	##-- AssetPlugin hooks
	def get_assets(self):
		return dict(js=["js/M117PopUp.js"])
		
	##-- Settings hooks
	def get_settings_defaults(self):
		return dict(msgType="info",autoClose=True,enableSpeech=False,speechVoice="",speechVolume=1,speechPitch=1,speechRate=1)	
	
	##-- Template hooks
	def get_template_configs(self):
		return [dict(type="settings",custom_bindings=True)]
		
	##~~ Softwareupdate hook
	def get_version(self):
		return self._plugin_version
		
	def get_update_information(self):
		return dict(
			m117popup=dict(
				displayName="M117PopUp",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="jneilliii",
				repo="OctoPrint-M117PopUp",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/jneilliii/OctoPrint-M117PopUp/archive/{target_version}.zip"
			)
		)

__plugin_name__ = "M117PopUp"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = M117PopUp()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.comm.protocol.gcode.queuing": __plugin_implementation__.AlertM117,
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}