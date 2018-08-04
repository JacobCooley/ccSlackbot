#CryptoBot for Slack
A bot that posts crypto prices/charts to a specified channel in your teams slack.
###Setup
1. Fork cryptoBot from `https://github.com/JacobCooley/cryptoBot`
2. Navigate to the folder and run `npm i`
3. Create a [Slack OAuth Token](https://api.slack.com/docs/oauth)
4. Create A [Slackbot](https://api.slack.com/bot-users#creating-bot-user) in your Teams Slack (only follow step 1)
5. Add 3 Environment Variables
    - slackBotCCOauth - Your Oauth token you created in Step 3
    - slackBotCCToken - Your Slackbot token from step 4
    - slackBotChannel - The name of your channel 
    
    **It is recommended to set different environment variables for the channel name on your local machine and your cloud platform if you want to change the code and test**

###Running

Once you have your repo environment variables on your cloud platform, simply run `npm run start`

###Help

Once the app is integrated, go to the channel and run cc help to see a list of commands