import * as React from 'react';
import Avatar from '@mui/material/Avatar';

function stringToColor(string) {
    let hash = 0;
    let i;

    try {
        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    } catch (e) {
        return "#ffffff";
    }
}

function stringAvatar(name) {
    let defaultChild = "U"
    if(name && typeof name === "string") {
        defaultChild = name.substring(0, 1);
    }
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: defaultChild,
    };
}

// props로 이름이 들어옵니다.
export default function LetterAvatar(props) {
    return (
            <Avatar {...stringAvatar(props.name)} />
    );
}