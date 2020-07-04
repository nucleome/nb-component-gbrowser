import React from 'react';
import {
    useRef,
    useState,
    useEffect
} from "react"
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button"
import ToggleButton from "@material-ui/lab/ToggleButton"
import IconButton from "@material-ui/core/IconButton"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import RefreshIcon from '@material-ui/icons/Refresh';
import FastForwardIcon from '@material-ui/icons/FastForward';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import ZoomInIcon from '../../icons/ZoomIn';
import ZoomOutIcon from '../../icons/ZoomOut';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import PrintIcon from '@material-ui/icons/Print';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import LinkIcon from '@material-ui/icons/Link';
import SettingsIcon from '@material-ui/icons/Settings';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import TextureIcon from '@material-ui/icons/Texture';
import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Divider from '@material-ui/core/Divider';

import Popover from '@material-ui/core/Popover';

import useStyles from "./styles"

import * as d3 from "d3"

import Slider from '@material-ui/core/Slider';
import {
    checkBool
} from "./hubsUtils"


function valueLabelFormat(value) {
    const [coefficient, exponent] = value
        .toExponential()
        .split('e')
        .map(item => Number(item));
    return `${Math.round(coefficient)}e^${exponent}`;
}

function existBool(v) {
    if (typeof v == "undefined") {
        return false
    } else {
        return v
    }
}
export default function appBar(props) {
    const classes = useStyles();
    //const classes = {props};
    //TODO Debgu
    const {
        dispatch,
        state,
        _width,
    } = props
    const studioRef = useRef()
    const configRef = useRef()
    const moreRef = useRef()
    const popRef = useRef()
    const navRef = useRef()
    const dividerRef = useRef()
    const navModeRef = useRef()
    const [anchorEl, setAnchorEl] = useState(null);
    const [bg, setBg] = useState(state.bg || false)
    const [width, setWidth] = useState(_width)
    const [chart, setChart] = useState(false)
    const [link, setLink] = useState(!existBool(state.unlink))
    const [zoom, setZoom] = useState(Math.log2(state.scaleFactor) || 0)
    const handleZoom = (event, value) => {
        setZoom(value)
        dispatch.call("scaleChange", this, value)
    }
    const handleClick = event => {
        setAnchorEl(event.currentTarget);
        if (width < 800) {
            console.log(popRef.current)
        }
    }
    const handleClose = () => {
        setAnchorEl(null);
        if (width < 800) {
            configRef.current.style.display = "none"
            studioRef.current.style.display = "none"
        }
        dividerRef.current.after(configRef.current)
        configRef.current.after(studioRef.current)
    }
    const handleEntered = () => {
        if (width < 800) {
            configRef.current.style.display = null
            studioRef.current.style.display = null
            popRef.current.after(configRef.current)
            configRef.current.after(studioRef.current)
        }
    }
    const handleUnlink = () => {
        setLink(!link)
    }


    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    useEffect(function(e) {
            if (width < 800) {
                studioRef.current.style.display = "none"
                configRef.current.style.display = "none"
                moreRef.current.style.display = null
            } else {
                studioRef.current.style.display = null
                configRef.current.style.display = null
                moreRef.current.style.display = "none"
            }

    }, [width])
    useEffect(function(e) {
        dispatch.on("resize.appbar", function(d) {
        setWidth(d)
    })
}, [])
return (
    <div className={classes.menubar}>
      <AppBar className={classes.appBar} position="static">
        <Toolbar variant="dense">
            <TextField
                      id="regionsInput"
                      defaultValue=""
                      className={classes.textField}
                      margin="dense"
                      variant="outlined"
            />
        <ButtonGroup aria-label="outlined button group" size="medium">
        <IconButton className={classes.iconButton} aria-label="Play" id="btnPlay" label="Plot">
        <PlayArrowIcon className={classes.icon}/>
      </IconButton>
      <IconButton className={classes.iconButton} aria-label="Refresh" id="btnRefresh">
        <RefreshIcon className={classes.icon}/>
      </IconButton>    
        </ButtonGroup>
        <ButtonGroup id="grpNav" ref={navRef}>
  <IconButton className={classes.iconButton} aria-label="Backward" id="btnBackward">
        <FastRewindIcon className={classes.icon}/>
      </IconButton>
      <IconButton className={classes.iconButton} id="btnForward">
        <FastForwardIcon className={classes.icon}/>
      </IconButton>    
   <IconButton className={classes.iconButton} aria-label="Zoom In" id="btnZoomIn">
        <ZoomInIcon  className={classes.icon}/>
      </IconButton>
      <IconButton className={classes.iconButton} aria-label="Zoom Out" id="btnZoomOut">
        <ZoomOutIcon className={classes.icon}/>
      </IconButton>    
             
        </ButtonGroup>
                  <Divider orientation="vertical" className={classes.divider} />
   <IconButton className={classes.iconButton} aria-label="Config" ref={dividerRef} id="btnConfig">
        <SettingsIcon className={classes.icon}/>
      </IconButton>    
        <ButtonGroup ref={configRef}>
  <IconButton className={classes.iconButton} aria-label="Batch Config" id="btnBatchConfig">
        <MenuOpenIcon className={classes.icon}/>
      </IconButton>    
  <IconButton className={classes.iconButton} aria-label="Expand" id="btnFull">
        <ExpandMoreIcon className={classes.icon}/>
      </IconButton>    
   <IconButton className={classes.iconButton} aria-label="Dense" id="btnDense">
        <ExpandLessIcon className={classes.icon}/>
      </IconButton>    
    </ButtonGroup>
       <ButtonGroup ref = {studioRef}>
  <IconButton className={classes.iconButton} aria-label="Export Current View" id="btnCamera">
        <CameraAltIcon className={classes.icon}/>
      </IconButton>
      <IconButton className={classes.iconButton} aria-label="Export SVG" id="btnPrint">
        <PrintIcon className={classes.icon}/>
      </IconButton>   
        </ButtonGroup>
   <IconButton className={classes.iconButton} ref={moreRef} aria-describedby={id} variant="contained" onClick={handleClick}>
        <MoreHorizIcon className={classes.icon}/>
    </IconButton>
   <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                onEntered = {handleEntered}
            anchorOrigin={{
                          vertical: 38,
                              horizontal: -180,
            }}
            transformOrigin={{
                          vertical: 'top',
                              horizontal: 'right',
            }}
            className={classes.popover}
        >
        <Typography ref={popRef} className={classes.typography}></Typography>

        </Popover>
    <Divider orientation="vertical" className={classes.divider} style={{display:checkBool(width>700)}}/>
    <ToggleButton
      className = {classes.toggleButton}
      selected={bg}
      onChange={() => {
        setBg(!bg);
      }} 
        id="btnBg"
        variant = "outlined"
        style={{display:checkBool(width>700)}}
        >

        <TextureIcon className={classes.icon}/>
    </ToggleButton>
   <ToggleButton aria-label="Chart" 
        id="btnChart" 
        className={classes.toggleButton}
        selected = {chart}
        onChange = {() => {
            setChart(!chart)
        }}
        variant="outlined"
    >
        <ScatterPlotIcon/>
      </ToggleButton>
    <Divider orientation="vertical" className={classes.divider} style={{display:checkBool(width > 700)}}/>
    
    {zoom==0?
    (<ButtonGroup><IconButton className={classes.iconButton} aria-label="UnLink" id="btnUnlink" onClick={handleUnlink}>
        {
            link?<LinkOffIcon className={classes.icon}/> : <LinkIcon className={classes.icon}/>
        }
        </IconButton></ButtonGroup>): (

            <Chip className={classes.chip} label={2**zoom} />
        )
    }   
    <ButtonGroup style={{display:checkBool(!link )}}>
    <IconButton className={classes.iconButton} aria-label="Unlink PLay" id="btnUnlinkPlay">
        <PlayArrowIcon className={classes.icon}/>
      </IconButton>
    </ButtonGroup>
    <Typography component="div" style={{display:checkBool(!!link ),paddingLeft:10,width:50}}>
<Slider
  value={zoom}
  min={0}
  step={1}
  max={6}
  onChange={handleZoom}
  className = {classes.slider}
  id="sliderZoom"
/>
</Typography>
    
        </Toolbar>
      </AppBar>
    </div>
);
}
