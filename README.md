# SoftChef CDK with VueJs

## Installation

```
  npm install sccdk-vue
  // or
  yarn add sccdk-vue
```

## Example
```
import { VueDeployment } from 'sccdk-vue'
// In your stack
// Basic deployment
const website = new VueDeployment(this, 'Website', {
  source: `${CLIENTS_PATH}`
})
```