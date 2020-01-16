const loadConfig = require('crds-cypress-config');
const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor')

function checkEnvironmentVariables(){
  const missingEnvVars = [];
  if(process.env.VAULT_ROLE_ID == undefined){
    missingEnvVars.push('VAULT_ROLE_ID');
  }
  if(process.env.VAULT_SECRET_ID == undefined){
    missingEnvVars.push('VAULT_SECRET_ID');
  }
  if(missingEnvVars.length > 0){
    const errorMessage = (length) => {
      return length == 1 ?
        "Required environment variable was not found: " :
        "Required environment variables were not found: ";
    }
    throw new Error(`${errorMessage(missingEnvVars.length)} ${missingEnvVars.join(', ')}`);
  }
}

module.exports = (on, config) => {
  on('file:preprocessor', cypressTypeScriptPreprocessor);


  const reportConsoleLog = config.env.reportConsoleLog || false
  if(reportConsoleLog){
    require('cypress-log-to-output').install(on);
  }

  checkEnvironmentVariables();

  // 1. Loads Vault secrets configured in /config/vault_config into Cypress's config.env object
  return loadConfig.loadConfigFromVault(config)
}
