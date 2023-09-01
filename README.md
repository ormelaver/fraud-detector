# fraud-detector [STILL IN DEVELOPMENT]
A backend app that detects credit card fraud.
Contains one end point that receives transaction data.
Technologies used:
Kafka, Redis, MongoDB, OOP, Docker, Typsecript, Express.js

Once a transaction is received, publishes it to a Kafka topic.
Once the server starts, it initiates a consumer for every rule and, another to handle alerts, and another consumer to handle data persistence (in MongoDB).
The consumers work in parallel.
When a transaction is flagged - the consumer that flagged it publishes it to a separate "flagged" topic.
The alert consumer takes care of sending alerts.

Uses Redis cache to handle the need to save recent transactions.

Redis, Kafka, and MongoDB servers are Dockerized.
