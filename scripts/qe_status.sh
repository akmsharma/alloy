ssh -t mowla@20.186.4.13 "cd /var/www/alloyio.com && 
npm run test:slreport && npm run functional:local && 
npm run allure:generate && 
cp /var/www/alloyio.com/allure/allure-report /var/www/qe.alloyio.com"