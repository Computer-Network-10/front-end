import * as React from 'react';
import {List, ListItem, ListItemText} from "@mui/material";
import LetterAvatar from "./LetterAvatar";

function ParticipantList(props) {
    const participantList = props.list;
    return (
        <List>
            <ListItemText primary="😃 Participant List" sx={{px: 1.5, color: "blue"}} />
            { participantList && participantList.map((item, index) => {
                return (
                    <ListItem key={index}>
                        <LetterAvatar name={item} />
                        <ListItemText primary={item} sx={{px:1.5}}>{item}</ListItemText>
                    </ListItem>
                );
            })}
        </List>
    );
}

export default ParticipantList;