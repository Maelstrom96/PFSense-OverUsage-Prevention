module.exports = {
	pfsense: {
		host: '192.168.2.1',
		port: 443,
		username: 'admin',
		password: 'something',
		PHPSESSID: 'lolololol',
		blockRuleId: 30,
		vnstat: {
			path: '/vnstat_fetch_json.php'
		},
		rules: {
			toggle: {
				path: '/firewall_rules.php?act=toggle&if=lan&id={id}'
			},
			apply: {
				path: '/firewall_rules.php?if=lan'
			}
		}
	},
	// Monthly allocation in GB
	datacap: '250',
	// Check interval in milliseconds
	checkInterval: 60 * 1000
}
