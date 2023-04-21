# What is this?

Call Honeybadger API to get details about a fault (error) and ask OpenAI's GPT to suggest a fix for the error.

# How to use

1. Create a `.env` file with the following variables:
    ```
    HONEYBADGER_API_AUTH_TOKEN=your_honeybadger_api_key
    HONEBADGER_PROJECT_ID=your_honeybadger_project_id
    HONEBADGER_FAULT_ID=your_honeybadger_fault_id
    OPENAI_API_KEY=your_openai_api_key
    ```
2. `npm run start`

# Example

Assuming the following fault (stacktrace):
```text
TypeError: Cannot read properties of undefined (reading 'valueA')
    at <unknown> ([PROJECT_ROOT]/index.js:27:27)
    at Layer.handle [as handle_request] ([NODE_MODULES]/express/lib/router/layer.js:95:5)
    at next ([NODE_MODULES]/express/lib/router/route.js:144:13)
    at Route.dispatch ([NODE_MODULES]/express/lib/router/route.js:114:3)
    at Layer.handle [as handle_request] ([NODE_MODULES]/express/lib/router/layer.js:95:5)
    at <unknown> ([NODE_MODULES]/express/lib/router/index.js:284:15)
    at Function.process_params ([NODE_MODULES]/express/lib/router/index.js:346:12)
    at next ([NODE_MODULES]/express/lib/router/index.js:280:10)
    at <unknown> ([PROJECT_ROOT]/index.js:19:3)
    at Layer.handle [as handle_request] ([NODE_MODULES]/express/lib/router/layer.js:95:5)
```

From the following snippet:
```text
// ...
app.post('/math-division', (req, res) => {
   const valueA = req.body.valueA
   const valueB = req.body.valueB
   if (valueB === 0) {
// ...
```

We _MIGHT_ the following output:
```text
The error is caused by trying to access a property of an undefined object. The 'valueA' property of the 'req.body' object is not defined, so the code needs to be changed to check if the object is defined before trying to access its properties.
27 -  const valueA = req.body.valueA
27 +  const valueA = req.body && req.body.valueA ? req.body.valueA : null
28 -  const valueB = req.body.valueB
28 +  const valueB = req.body && req.body.valueB ? req.body.valueB : null
```

Or this:
```text
Check if req.body is defined before accessing its properties
26 +  if (req.body) {
27 -  const valueA = req.body.valueA
27 +    const valueA = req.body.valueA
28 -  const valueB = req.body.valueB
28 +    const valueB = req.body.valueB
29 -  if (valueB === 0) {
29 +    if (valueB === 0) {
29 +    }
```

