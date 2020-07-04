import React from "react"
import SvgIcon from '@material-ui/core/SvgIcon';

function ThreeDLine(props) {
    return (
    <SvgIcon {...props}>
	    <polyline fill="none" stroke="#000000" stroke-width="2.235" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"
        points="12,3.2 3.6,19.5 20.9,19.5 " />
    </SvgIcon>
    );
}

export default ThreeDLine
