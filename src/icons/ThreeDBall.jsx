import React from "react"
import SvgIcon from '@material-ui/core/SvgIcon';

function ThreeDBall(props) {
    return (
    <SvgIcon {...props}>
        <circle cx="12" cy="6.5" r="4.4"/>
        <circle cx="6.8" cy="17.5" r="4.4"/>
        <circle cx="17.7" cy="17.5" r="4.4"/>
    </SvgIcon>
    );
}

export default ThreeDBall
