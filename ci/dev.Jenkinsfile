properties([
  pipelineTriggers([
    [
      $class: 'BitBucketPPRTrigger',
      triggers: [
        [
          $class: 'BitBucketPPRRepositoryTriggerFilter',
          actionFilter: [
            $class: 'BitBucketPPRRepositoryPushActionFilter',
            triggerAlsoIfNothingChanged: true,
            triggerAlsoIfTagPush: false,
            // Specify the branch that triggers the pipeline
            allowedBranches: "dev",
            isToApprove: true
          ]
        ]
      ]
    ]
  ])
])

pipeline {
  environment {
    // Variables
    PIPELINE_TYPE = "docker" // Type of pipeline, used for identification and versioning
    ENV = "dev" // Sets the ENV variable to indicate the deployment environment (live, stage, dev)
    SSH_HOST = "xxx.xxx.xxx.xxx" // The IP or domain of the server where this deploy is performed
    SSH_HOST_PORT = "22" // Port for the SSH connection
    SSH_USER = "user" // User for the SSH connection
    PROJECT_DIR = "path/to/project/dir" // Directory where the deployment is performed
    SSH_CREDS = 'project-env-creds' // SSH credentials, including the SSH key and user for server connection
    // DISCORD_WEBHOOK = "project-webhook" // The webhook for the official Discord project channel, intended for deployment notifications.
    DISCORD_WEBHOOK = "oxide-webhook" // The webhook for the Discord test channel, intended for deployment notifications.

    // Constants
    BRANCH = "${ENV == 'live' ? 'main' : (ENV == 'stage' ? 'stage' : 'dev')}" // The branch to be used for deployment, based on the environment (live, stage, dev)
    PIPELINE_VERSION = "1.1.7" // Pipeline version - Changes: 1.1.0 (Refactored Discord notification, fixed the issue with commit links not parsing correctly, and simplified the code slightly.); 1.1.1 (Added PIPELINE_TYPE and printed it in the pipeline version.);1.1.2 (Added the dev environment and changed the branch to be used in the pipeline for "next" type.); 1.1.3 (Moved the exclusions in ftp and ftp_php_script types to the variable EXCLUDES); 1.1.4(specified the branch in the checkout stage for git fetch command for type ftp and ftp_php_script); 1.1.5 (added dev env to all types);1.1.6 (renamed the next type to docker to be broader and moved the cicd files in the ci folder); 1.1.7 (added .env source commands in the deploy step for docker type)

  }
  agent any
  options {
    disableConcurrentBuilds(abortPrevious: true) // Prevent concurrent builds, abort previous ones
    timestamps() // Add timestamps to the console output
    ansiColor('xterm') // Enable ANSI color output
  }
  parameters {
    booleanParam(name: 'REFRESH', defaultValue: false, description: 'Don’t run any action, just refresh pipeline from GIT') // Parameter to refresh the pipeline without running actions
  }
  stages {
    stage('Refresh') {
      when { expression { return params.REFRESH} } // Run this stage only if REFRESH is true
      steps {
        script {
          echo 'Refreshing pipeline from GIT'
          echo "Pipeline Version: ${PIPELINE_VERSION} ${PIPELINE_TYPE}"
        }
      }
    }
    stage('Extracting BitBucket payload data') {
      when {
        expression { return env.BITBUCKET_PAYLOAD != null } // Run this stage only if BITBUCKET_PAYLOAD is not null
      }
      steps {
        script {
          withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDS, keyFileVariable: 'SSH_KEY')]) {
            sh '''
              eval `ssh-agent -s`
              ssh-add ${SSH_KEY}
              git fetch origin ${BRANCH}
            '''
          }

          // Get the latest commit message from the ${BRANCH} branch
          def commitMessage = sh(script: 'git log origin/${BRANCH} -1 --pretty=%B', returnStdout: true).trim()

          // Store it in an environment variable
          env.BITBUCKET_COMMIT_MESSAGE = commitMessage.replaceAll('\n', '\\\\n')

          // Output the parsed commit message for verification
          echo "Commit Message from ${env.BRANCH} branch: ${env.BITBUCKET_COMMIT_MESSAGE}"

          // Parse the BITBUCKET_PAYLOAD if it exists
          def parsedPayload = readJSON(text: env.BITBUCKET_PAYLOAD)

          if (parsedPayload.push && parsedPayload.push.changes) {
            env.BITBUCKET_COMMIT_HASH = parsedPayload.push?.changes[0]?.commits[0]?.hash

            // Output the parsed values for verification
            echo "Commit Hash from BitBucket Payload: ${env.BITBUCKET_COMMIT_HASH}"
          } else {
            error("Invalid BITBUCKET_PAYLOAD structure")
          }
        }
      }
    }
    stage('Deploy') {
      when { expression { return !params.REFRESH } } // Run this stage only if REFRESH is false
      steps {
        script {
          echo "Pipeline Version: ${PIPELINE_VERSION} ${PIPELINE_TYPE}"
          def remote = [:]
          remote.name = 'SSH_HOST'
          remote.host = SSH_HOST
          remote.port = SSH_HOST_PORT.toInteger()
          remote.allowAnyHosts = true
          remote.logLevel = 'INFO'

          // Use withCredentials to pass both the SSH username and the private key
          withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDS, keyFileVariable: 'SSH_KEY')]) {
            remote.user = SSH_USER
            remote.identityFile = SSH_KEY
            echo "Deploying to ${remote.host} as ${remote.user}"
            echo "Running deploy on ${ENV} environment"

            sshCommand remote: remote, command: "cd ${PROJECT_DIR} && git fetch origin && git checkout ${BRANCH} && git reset --hard origin/${BRANCH}"

            sshCommand remote: remote, command: """
              [ -f ~/.profile ] && source ~/.profile
              [ -f ~/.bashrc ] && source ~/.bashrc
              cd ${PROJECT_DIR}
              set -a && source .env && set +a
              docker compose -f ci/docker-compose.${ENV}.yaml -p ${ENV} up --build --force-recreate -d
            """

            sshCommand remote: remote, command: "docker builder prune -f"
          }
        }
      }
    }
  }
  post {
    success {
      script {
        if (params.REFRESH == false) {
          def discordWebhookURL = ''
          withCredentials([string(credentialsId: DISCORD_WEBHOOK, variable: 'DISCORD_WEBHOOK_EXTRACTED')]) {
            discordWebhookURL = DISCORD_WEBHOOK_EXTRACTED
          }
          def embedFields = [
            [name: "Job name", value: "${env.JOB_NAME}"]
          ]
          if (env.BITBUCKET_PAYLOAD) {
            def jsonSlurper = new groovy.json.JsonSlurper()
            def pld = jsonSlurper.parseText(env.BITBUCKET_PAYLOAD)
            def commitURLs = pld.push.changes.collectMany { change -> change.commits.collect { commit -> commit.links.html.href } }
            def commitURLsStr = commitURLs.take(4).join('\n')
            embedFields += [
              [name: "Branch name", value: "${env.BITBUCKET_TARGET_BRANCH}"],
              [name: "Commit author", value: "${env.BITBUCKET_ACTOR}"],
              [name: "Commit message", value: "${env.BITBUCKET_COMMIT_MESSAGE}"],
              [name: "Commit URL(s)", value: commitURLsStr], // Limit to 4 URLs
              [name: "Commit hash", value: "${env.BITBUCKET_COMMIT_HASH}"]
            ]
          } else {
            embedFields += [[name: "Pipeline triggered manually", value: "No commit data available"]]
          }
          def payloadMap = [
            username: "Jenkins",
            embeds: [[
              title: "Deployment Status",
              description: "Deployment was successful!",
              color: 3066993, // green
              fields: embedFields
            ]]
          ]
          def jsonPayload = groovy.json.JsonOutput.toJson(payloadMap)
          writeFile file: 'discord_payload.json', text: jsonPayload
          sh "curl -X POST -H 'Content-Type: application/json' --data @discord_payload.json ${discordWebhookURL}"
          echo "Discord Payload:\n${jsonPayload}"
          sh "rm discord_payload.json"
        }
      }
    }
    failure {
      script {
        if (params.REFRESH == false) {
          def discordWebhookURL = ''
          withCredentials([string(credentialsId: DISCORD_WEBHOOK, variable: 'DISCORD_WEBHOOK_EXTRACTED')]) {
            discordWebhookURL = DISCORD_WEBHOOK_EXTRACTED
          }
          def embedFields = [
            [name: "Job name", value: "${env.JOB_NAME}"]
          ]
          if (env.BITBUCKET_PAYLOAD) {
            def jsonSlurper = new groovy.json.JsonSlurper()
            def pld = jsonSlurper.parseText(env.BITBUCKET_PAYLOAD)
            def commitURLs = pld.push.changes.collectMany { change -> change.commits.collect { commit -> commit.links.html.href } }
            def commitURLsStr = commitURLs.take(4).join('\n')
            embedFields += [
              [name: "Branch name", value: "${env.BITBUCKET_TARGET_BRANCH}"],
              [name: "Commit author", value: "${env.BITBUCKET_ACTOR}"],
              [name: "Commit message", value: "${env.BITBUCKET_COMMIT_MESSAGE}"],
              [name: "Commit URL(s)", value: commitURLsStr], // limited to last 4
              [name: "Commit hash", value: "${env.BITBUCKET_COMMIT_HASH}"]
            ]
          } else {
            embedFields += [[name: "Pipeline triggered manually", value: "No commit data available"]]
          }
          def payloadMap = [
            username: "Jenkins",
            embeds: [[
              title: "Deployment Status",
              description: "Deployment failed!",
              color: 15158332, // red
              fields: embedFields
            ]]
          ]
          def jsonPayload = groovy.json.JsonOutput.toJson(payloadMap)
          writeFile file: 'discord_payload.json', text: jsonPayload
          sh "curl -X POST -H 'Content-Type: application/json' --data @discord_payload.json ${discordWebhookURL}"
          echo "Discord Payload:\n${jsonPayload}"
          sh "rm discord_payload.json"
        }
      }
    }
  }
}
