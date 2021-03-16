import React from "react"
import {
    useState
} from "react"
//import useStyles from "./styles"
//import useStyles from "../../../../nb-component-track3d/src/styles"
import useStyles from "../../../../../src/styles.js"
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from "@material-ui/core/IconButton"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import ToggleButton from "@material-ui/lab/ToggleButton"


import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


export default function(props) {
    const {
        dispatch
    } = props
    const classes = useStyles()
    const [genomes, setGenomes] = useState([])
    const [genome, setGenome] = useState("hg38")
    const [sent, setSent] = useState(false)
    const [open, setOpen] = useState(false)
    const handleGenome = (d) => {
        dispatch.call("setGenome", this, d.target.value)
    }

    dispatch.on("setGenomes.appbar", function(d) {
        setGenomes(d)
    })
    dispatch.on("setGenome.appbar", function(d) {
        setGenome(d)
    })
    return (
        <div className={classes.menuBar}>
      <AppBar className={classes.appBar} position="static">
        <Toolbar variant="dense">
  <IconButton aria-label="Play" id="btnPlay" label="Plot" className={classes.iconButton}>
        <PlayArrowIcon className={classes.icon}/>
      </IconButton>
<ToggleButton
      className = {classes.toggleButton}
      selected={open}
      onChange={() => {
        setOpen(!open);
      }} 
        id="btnCog"
        variant = "outlined"
        >
        <SettingsIcon className={classes.icon}/>
    </ToggleButton>

       
       <IconButton className={classes.iconButton} aria-label="Refresh" id="btnRefresh">
        <RefreshIcon className={classes.icon}/>
      </IconButton>
        <FormControl className={classes.formControl}>
        <Select 
          labelId="Genome"
          id="inputGenome"
          value={genome}
          onChange={handleGenome}
          className = {classes.select}
        >
        {genomes.map((d)=>
            (<MenuItem value={d} className={classes.menuItem}>{d}</MenuItem>)
        )}
        </Select>
        <FormHelperText>Genome Version</FormHelperText>
      </FormControl>
        </Toolbar>
      </AppBar>
    </div>
    );

}
