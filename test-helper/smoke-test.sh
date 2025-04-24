# simple smoke test: runs two queries using the lambda that should be deployed
# which connects to the database
# it fails if the lambda cannot be called, or the database is not accessible/the tables are not available

awslocal lambda invoke --cli-binary-format raw-in-base64-out --function-name my-lambda-rds-query-helper --payload '{"sqlQuery": "show tables", "secretName":"/rdsinitexample/rds/creds/mysql-01"}' output1
echo "show tables:"
cat output1

awslocal lambda invoke --cli-binary-format raw-in-base64-out --function-name my-lambda-rds-query-helper --payload '{"sqlQuery": "select Author from Books", "secretName":"/rdsinitexample/rds/creds/mysql-01"}' output2
echo "select Author from Books:"
cat output2


return_status1=$(cat output1 | jq -r .status)
if [ "SUCCESS" !=  ${return_status1} ]; then
    echo "unexpected response for query1: ${return_status1}"
    cat output1
    exit 1
fi

return_status2=$(cat output2 | jq -r .status)
if [ "SUCCESS" !=  ${return_status2} ]; then
    echo "unexpected response for query2: ${return_status2}"
    cat output2
    exit 1
fi