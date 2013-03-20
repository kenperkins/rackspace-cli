var program = require('commander'),
    rackspace = require('rackspace');

// This is the entry point for Rackspace CLI

var CommandLine = function() {
    var self = this;

    self.app = program;

    self.app
        .version(rackspace.version)
        .option('--auth', 'Authenticate with Rackspace and get a token')
        .option('--username <username>', 'Your Rackspace account username')
        .option('--password <password>', 'Your Rackspace account password')
        .option('--apiKey <apiKey>', 'Your Rackspace account API key')
        .option('--region [region]', 'Preferred region for API calls')
        .option('--cache', 'Cache the results of the auth call for later use')
        .option('--token <token>', 'Token for making authenticated API calls')
        .option('--getServers', 'Get the instances for the specified region');
};

CommandLine.prototype.run = function() {
    var self = this;

    self.app. parse(process.argv);

    if (self.app.auth) {
        self.authenticate();
    }
    else if (self.app.token) {
        if (self.app.getServers) {
            rackspace.createClient({
                loadFromFile: true,
                token: self.app.token,
                region: self.app.region
            }, function(err, client) {

                if (err) {
                    console.dir(err);
                    return;
                }

                client.servers.getServers(function(err, servers) {
                    console.dir(err);
                    console.dir(servers);
                });
            });
        }
    }
};

CommandLine.prototype.authenticate = function() {
    var self = this;

    var cfg = {};

    if (self.app.username && self.app.apiKey) {
        cfg.username = self.app.username;
        cfg.apiKey = self.app.apiKey;
    }
    else if (self.app.username && self.app.password) {
        cfg.username = self.app.username;
        cfg.password = self.app.password;
    }
    else {
        throw 'Error';
    }

    if (self.app.region) {
        cfg.region = self.app.region;
    }

    rackspace.createClient(cfg, function(err, client) {
        if (err) {
            console.dir(err);
            return;
        }

        console.log('Successfully authenticated against Rackspace Identity v2.0:\n');
        console.log('Token: ' + client.auth.token.id);

        if (self.app.cache) {
            rackspace.core.identity.saveIdentity(client.auth, function(err) {
                console.log(err ? 'Unable to cache authentication results' :
                    'Cached results into: ' + client.auth.token.id + '.json');
                process.exit(err ? 1 : 0);
            });
        }
        else {
            process.exit(0);
        }

    });
};

exports.CommandLine = CommandLine;