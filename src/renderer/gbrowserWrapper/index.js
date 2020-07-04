import React,{useRef,useState,useEffect} from "react"
import render from "../hubsReact"
import {dispatch} from "d3-dispatch"
import $ from "jquery"
//import * as d3 from "d3"
// interface
// layout.eventHub
// container.setState
// container.getState
// DONE: container.getElement()[0]  for d3.select(el)..
// DONE: container.width
// DONE: container.height
// DONE: container.on("resize")
// layout.eventHub.on   ...
// layout.eventHub.emit ...
// TODO Modal CSS
//      Popup CSS
//      State Recovery
function generateContainer(el,width,height) {
    var state = {}
    var events = {
        "resize":true,
    }
    var event = dispatch("resize")
    var container = function(){
    }
    container.getState = function() {
        return state
    }
    container.setState = function(_) {
        for (var k in _) {
            state[k] = _[k]
        }
    }
    container.extendState = container.setState
    container.width = width 
    container.height = height
    container.getElement = function() {
        return $(el)
    }
    container.on = function(code,func) {
        event.on(code,func)
    }
    container.emit = function(code,d) {
        if (code in events) {
            event.call(code,this,d)
        }
    }
    //AND emit resize ...
    // TODO Local Event Using Pure Javascript 
    return container
}
//TODO eventHub on , dispatch 
function generateEventHub(){
    var eventHub = function(){

    }
    eventHub.emit = function(_) {

    }
    eventHub.on = function(_) {

    }
    return eventHub
}
function  generateLayout() {
    var layout = function(){
    }
    layout.eventHub = generateEventHub()
    return layout
}

function app(props) {
    const myRef = useRef();
    const {width,height} = props
    useEffect(function(){
        var el = myRef.current
        var container = generateContainer(el, width, height)
        var state = {trackViews:[]}
        container.setState(state) //TODO Local
        var layout = generateLayout()
        window.addEventListener("resize", function(){
            //console.log("element",el.clientHeight, el.clientWidth)
            container.height = el.clientHeight
            container.width = el.clientWidth
            container.emit("resize",{
                width: el.clientWidth,
                height: el.clientHeight
            })
        })
        render(layout,container,state,{})
    },[])
    return (
    <div class="lm_item lm_stack s_content">
    <div class="lm_items lm_container">
    <div class="lm_content">
    <div ref={myRef} style={{height:"100%",width:"100%"}}>
    </div>
    </div>
    </div>
    </div>)
}
export default app
