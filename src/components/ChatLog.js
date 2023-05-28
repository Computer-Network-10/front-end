import {Box, Chip, Grid, List, ListItem, ListItemText} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import {useEffect, useRef} from "react";

// 현재 시간을 00:00 형태로 반환하는 함수
export function transformTime(time) {
    try {
        const date = new Date(time);

        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

        return hours + ':' + minutes;
    }
    catch(e) {
        return "00:00";
    }
}

// 이후 props로 align(right or left), text, time 등을 받아와야 할 것입니다.
function ChatLog(props) {
    const scrollRef = useRef();

    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });

    const chatLogList = props.list;
    const userName = props.name;
    return (
        <List ref={scrollRef} sx={{height: "75vh", overflowY: "auto"}}>
            {chatLogList.map((item, idx) => {
                if(item.type === 0 || item.type === -1) {
                    return (
                        <ListItem key={idx} sx={{pb:2}}>
                            <Box align="center" sx={{margin:"auto"}}>
                                <Chip variant="outlined" color="secondary" label={item.chat}/>
                            </Box>
                        </ListItem>
                    );
                }
                return (
                    <ListItem key={idx} sx={{pb:2}}>
                        {userName === item.sender ?
                            <Grid container>
                                <Grid item xs={12}>
                                    <Box align="right">
                                        <Chip
                                            size="medium"
                                            sx={{
                                                height: 'auto',
                                                '& .MuiChip-label': {
                                                    display: 'block',
                                                    whiteSpace: 'normal',
                                                },
                                                p: 1
                                            }}
                                            label={item.chat}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <ListItemText align="right" secondary={transformTime(item.time)} sx={{mr:1}}/>
                                </Grid>
                            </Grid>
                            : <Grid container>
                                <Grid item xs={0.7}>
                                    <LetterAvatar name={item.sender}/>
                                </Grid>
                                <Grid item xs={11.3}>
                                    <Box align="left">
                                        <Chip
                                            size="medium"
                                            sx={{
                                                height: 'auto',
                                                '& .MuiChip-label': {
                                                    display: 'block',
                                                    whiteSpace: 'normal',
                                                },
                                                p: 1
                                            }}
                                            label={item.chat}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <ListItemText align="left" secondary={transformTime(item.time)}/>
                                </Grid>
                            </Grid>}
                    </ListItem>
                );
            })}
        </List>
    );
}

export default ChatLog;