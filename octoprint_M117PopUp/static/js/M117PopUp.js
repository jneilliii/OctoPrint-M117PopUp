$(function() {
    function M117PopUpViewModel(parameters) {
        var self = this;
		
		self.settingsViewModel = parameters[0];
		
		self.autoClose = ko.observable();
		self.enableSpeech = ko.observable();
		self.speechVoice = ko.observable();
		self.voices = ko.observableArray();
		self.speechEnabledBrowser = ko.observable();
		self.msgType = ko.observable();
		self.msgTypes = ko.observableArray([{
						name : 'Notice',
						value : 'notice'
					}, {
						name : 'Error',
						value : 'error'
					}, {
						name : 'Info',
						value : 'info'
					}, {
						name : 'Success',
						value : 'success'
					}, {
						name : 'Disabled',
						value : 'disabled'
					}
				]);

		self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != "M117PopUp") {
				// console.log('Ignoring '+plugin);
                return;
            }
			
			if(data.type == "popup") {
				// console.log(data.msg);
				if(self.settingsViewModel.settings.plugins.M117PopUp.msgType() != "disabled"){
					new PNotify({
						title: 'M117 Pop Up Message',
						text: data.msg,
						type: self.settingsViewModel.settings.plugins.M117PopUp.msgType(),
						hide: self.settingsViewModel.settings.plugins.M117PopUp.autoClose()
						});
				}
				if(self.enableSpeech() && ('speechSynthesis' in window)){
					var msg = new SpeechSynthesisUtterance(data.msg);
					msg.voice = speechSynthesis.getVoices().filter(function(voice){return voice.name == self.speechVoice(); })[0];
					window.speechSynthesis.speak(msg);
				}
			}
		}
		
		self.onBeforeBinding = function() {
            self.msgType(self.settingsViewModel.settings.plugins.M117PopUp.msgType());
            self.autoClose(self.settingsViewModel.settings.plugins.M117PopUp.autoClose());
			self.enableSpeech(self.settingsViewModel.settings.plugins.M117PopUp.enableSpeech());
			self.speechVoice(self.settingsViewModel.settings.plugins.M117PopUp.speechVoice());
			self.loadVoices();
        }
		
		self.onEventSettingsUpdated = function (payload) {            
            self.msgType = self.settingsViewModel.settings.plugins.M117PopUp.msgType();
            self.autoClose = self.settingsViewModel.settings.plugins.M117PopUp.autoClose();
			self.enableSpeech(self.settingsViewModel.settings.plugins.M117PopUp.enableSpeech());
			self.speechVoice(self.settingsViewModel.settings.plugins.M117PopUp.speechVoice());
        }
		
		self.loadVoices = function() {
			self.voices.removeAll();
			var voicenames = speechSynthesis.getVoices();
			voicenames.forEach(function(voice, i) {
				self.voices.push({'name':voice.name,'value':voice.name})
				});
			}
			
		window.speechSynthesis.onvoiceschanged = function(e) {
		  self.loadVoices();
		};
    }

    // This is how our plugin registers itself with the application, by adding some configuration
    // information to the global variable OCTOPRINT_VIEWMODELS
    ADDITIONAL_VIEWMODELS.push([
        // This is the constructor to call for instantiating the plugin
        M117PopUpViewModel,

        // This is a list of dependencies to inject into the plugin, the order which you request
        // here is the order in which the dependencies will be injected into your view model upon
        // instantiation via the parameters argument
        ["settingsViewModel"],

        // Finally, this is the list of selectors for all elements we want this view model to be bound to.
        ["#settings_plugin_M117PopUp_form"]
    ]);
});