import {
    makeStyles
} from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    menubar: {
        flexGrow: 1,
        flexWrap: 'wrap',
    },
    textField: {
        //paddingLeft: 0,
        //marginRight: theme.spacing(1),
        width: 215,
        //fontSize: 15,
        fontWeight: "normal",
        //autoWidth: true,
        //overflowX: "auto",
    },
    typography: {
        fontFamily: [
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        fontSize:18,
    },
    menuButton: {
        marginRight: theme.spacing(1),
    },
    appBar: {
        fontWeight: "bold",
        backgroundColor: "#FFFFFF",
        color: "#27282E",
        fontSize:18
    },
    title: {
        flexGrow: 1,
        fontSize: 14,
    },
    button: {
        fontSize: 16,
    },
    iconButton: {
    },
    icon: {
        fontSize:20,
    },
    toggleButton: {
        marginLeft: theme.spacing(1),
        height: 20,
        width: 20, 
    },
    divider: {
    alignSelf: 'stretch',
    height: 'auto',
    margin: theme.spacing(1, 0.5),
    },
    slider: {
        width:100,
    },
    select: {
        fontSize:12,
    },
    menuItem: {
        fontSize:12,
    },
    popover: {
        height: 'auto',
    },
    chip: {
        fontSize:12,
    }

}));

export default useStyles


