fx_version 'cerulean'
game 'gta5'

author 'Skulrag <skulragpro@gmail.com>'
description 'Skulrag\'s trucker job'
version '1.0.0'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/assets/*'
}

shared_script {
    '@ox_lib/init.lua',
    '@qbx_core/modules/lib.lua'
}

client_scripts {
	'@qbx_core/modules/playerdata.lua',
	'configs/config.lua',
	'client/*.lua'
}

server_scripts {
	'@oxmysql/lib/MySQL.lua',
	'config/server.lua',
	'server/*.lua'
}


escrow_ignore {
	'config/server.lua',
	'locales/*.json'
}

dependencies {
	'qbx_core',
	'ox_lib',
	'oxmysql'
}