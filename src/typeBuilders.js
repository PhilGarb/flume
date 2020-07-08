const define = (value, defaultValue) => value !== undefined ? value : defaultValue

const buildControlType = (defaultConfig, validate = ()=>{}) => config => {
  validate(config);
  return {
    type: defaultConfig.type,
    label: define(config.label, defaultConfig.label || ""),
    name: define(config.name, defaultConfig.name || ""),
    defaultValue: define(config.defaultValue, defaultConfig.defaultValue)
  }
}

export const Controls = {
  text: buildControlType({
    type: "text",
    name: "text",
    defaultValue: ""
  }),
  select: buildControlType({
    type: "select",
    name: "select",
    defaultValue: ""
  }),
  number: buildControlType({
    type: "number",
    name: "number",
    defaultValue: 0
  }),
  checkbox: buildControlType({
    type: "checkbox",
    name: "checkbox",
    defaultValue: false
  }),
  multiselect: buildControlType({
    type: "multiselect",
    name: "multiselect",
    defaultValue: []
  }),
}

export const Colors = {
  red: "red",
  blue: "blue",
  purple: "purple",
  green: "green",
  pink: "pink",
  grey: "grey",
  yellow: "yellow"
}

export const getPortBuilders = ports => Object.values(ports).reduce((obj, port) => {
  obj[port.type] = (config = {}) => {
    return {
      type: port.type,
      name: config.name || port.name,
      label: config.label || port.label
    }
  }
  return obj
}, {})

export class FlumeConfig{
  constructor(){
    this.nodeTypes = {}
    this.portTypes = {}
  }
  addNodeType(config){
    if(typeof config !== "object" && config !== null){
      throw new Error("You must provide a configuration object when calling addNodeType.")
    }
    if(typeof config.type !== "string"){
      throw new Error(`Required key, "type" must be a string when calling addNodeType.`)
    }
    if(typeof config.initialWidth !== "undefined" && typeof config.initialWidth !== "number"){
      throw new Error(`Optional key, "initialWidth" must be a number when calling addNodeType.`)
    }
    if(this.nodeTypes[config.type] !== undefined){
      throw new Error(`A node with type "${config.type}" has already been declared.`)
    }
    const node = {
      type: config.type,
      label: define(config.label, ""),
      description: define(config.description, ""),
      addable: define(config.addable, true),
      deletable: define(config.deletable, true)
    }
    if(config.initialWidth){
      node.initialWidth = config.initialWidth
    }
    if(typeof config.inputs === "function"){
      const inputs = config.inputs(getPortBuilders(this.portTypes))
      if(!Array.isArray(inputs)){
        throw new Error(`When providing a function to the "inputs" key, you must return an array.`)
      }
      node.inputs = inputs;
    }else if(config.inputs === undefined){
      node.inputs = [];
    }else if(!Array.isArray(config.inputs)){
      throw new Error(`Optional key, "inputs" must be an array.`)
    }else{
      node.inputs = config.inputs
    }

    if(typeof config.outputs === "function"){
      const outputs = config.outputs(getPortBuilders(this.portTypes))
      if(!Array.isArray(outputs)){
        throw new Error(`When providing a function to the "inputs" key, you must return an array.`)
      }
      node.outputs = outputs;
    }else if(config.outputs === undefined){
      node.outputs = [];
    }else if(config.outputs !== undefined && !Array.isArray(config.outputs)){
      throw new Error(`Optional key, "outputs" must be an array.`)
    }else{
      node.outputs = config.outputs
    }

    this.nodeTypes[config.type] = node;
    return this;
  }
  addPortType(config){
    if(typeof config !== "object" && config !== null){
      throw new Error("You must provide a configuration object when calling addPortType")
    }
    if(typeof config.type !== "string"){
      throw new Error(`Required key, "type" must be a string when calling addPortType.`)
    }
    if(this.portTypes[config.type] !== undefined){
      throw new Error(`A port with type "${config.type}" has already been declared.`)
    }
    if(typeof config.name !== "string"){
      throw new Error(`Required key, "name" must be a string when calling addPortType.`)
    }

    const port = {
      type: config.type,
      name: config.name,
      label: define(config.label, ""),
      color: define(config.color, Colors.grey)
    };

    if(config.acceptTypes === undefined){
      port.acceptTypes = [config.type]
    }else if(!Array.isArray(config.acceptTypes)){
      throw new Error(`Optional key, "acceptTypes" must be an array.`)
    }else{
      port.acceptTypes = config.acceptTypes
    }

    if(config.controls === undefined){
      port.controls = []
    }else if(!Array.isArray(config.controls)){
      throw new Error(`Optional key, "controls" must be an array.`)
    }else{
      port.controls = config.controls
    }

    this.portTypes[config.type] = port;
    return this;
  }
}