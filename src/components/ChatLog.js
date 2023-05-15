import {Grid, List, ListItem, ListItemText} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import {useEffect, useRef} from "react";

// 이후 props로 align(right or left), text, time 등을 받아와야 할 것입니다.
function ChatLog(props) {
    const scrollRef = useRef();

    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });

    const chatLogList = props.list;
    const userName = props.name;
    return (
        <List ref={scrollRef} sx={{height: "85vh", overflowY: "auto"}}>
            {chatLogList.map((item, idx) => {
                return (
                    <ListItem key={idx}>
                        {userName === item.name ?
                            <Grid container>
                                <Grid item xs={12}>
                                    <ListItemText align="right" primary={item.text}/>
                                </Grid>
                                <Grid item xs={12}>
                                    <ListItemText align="right" secondary={item.time}/>
                                </Grid>
                            </Grid>
                            : <Grid container>
                                <Grid item xs={0.7}>
                                    <LetterAvatar name={item.name}/>
                                </Grid>
                                <Grid item xs={11.3}>
                                    <ListItemText align="left" primary={item.text}/>
                                </Grid>
                                <Grid item xs={12}>
                                    <ListItemText align="left" secondary={item.time}/>
                                </Grid>
                            </Grid>}
                    </ListItem>
                );
            })}
        </List>
    );
}

export default ChatLog;