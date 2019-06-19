# Simple Serverless Framework

I have been using the [Serverless Framework](www.serverless.com) to build AWS Lambda functions with Node and Express,
but one of the issues that I faced was that a simple deployment was over 25MB because of all of the dependencies that
Express requires. Express is a great framework, but it does so much more than I need.

In an attempt to reduce the size of my deployment I created a simple serverless web framework that looks remarkably
like Express, but does not have any dependencies. The syntax is so similar, as a matter of fact, that I changed my import
from Express to  my new framework and I only required a single change: mapping paths like ```/user/:id``` to 
```/user/{id}```. I rebuilt my project using ```sls deploy``` and all of the code worked without modification.

This is still very limited to the features I am using, but it is built modular enough to add any features that you
may need that are missing. 

Currently I have support for:
* Parse an API Gateway event and convert it to an Express-like ```req```
* Standard ```get```, ```put```, ```post```, ```patch```, and ```delete``` handlers
* A simple middleware framework that behaves similar to Express: ```(req, res, next) => {...}```
* A ```res``` object that behaves similar to Express
* Advice (new): you can add ```BEFORE```, ```AFTER```, or ```AROUND``` advice that is executed after all middlewares, but 
before, after, or around the actual handler invocation; I needed this for performance measurements

Take a look at the unit tests for examples.