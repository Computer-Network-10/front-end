import {
    Divider, Grid, List, ListItem,
    ListItemText, TextField, Button, Box, Slide
} from "@mui/material";
import React, {Fragment, useEffect, useState} from "react";
import LetterAvatar from "./LetterAvatar";
import ParticipantList from "./ParticipantList";
import ChatLog from "./ChatLog";
import * as StompJS from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";

const API_URL = process.env.REACT_APP_API_URL;
const BASE_URL = process.env.REACT_APP_BASE_URL;

let client;
let subscription;

// Dialog가 아래에서 위로 올라가는 느낌을 주기위해 선언한 변수
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function mySocketFactory() {
    return new SockJS(BASE_URL);
}

function currentDate() {
    const date = new Date();
    const hour = (date.getHours() < 10) ? "0" + date.getHours().toString() : date.getHours();
    const minute = (date.getMinutes() < 10) ? "0" + date.getMinutes().toString() : date.getMinutes();

    return `${hour}:${minute}`;
}

function Chat(props) {
    const userName = props.name;
    const handleOpen = props.handleOpen;
    const [message, setMessage] = useState("");
    const [chatLog, setChatLog] = useState([
        {
            type: 0,
            sender: userName,
            time: currentDate(),
            chat: `'${userName}'님이 입장하셨습니다!`
        }
    ]);

    const [partyList, setPartyList] = useState(null);

    // 다이로그 open 변수
    const [open, setOpen] = useState(true);

    const [frontNum, setFrontNum] = useState("");
    const [endNum, setEndNum] = useState("");

    const handleInput = (e) => {
        if(e.target.id === "front"){
            setFrontNum(e.target.value);
        }
        else{
            setEndNum(e.target.value);
        }
    }

    // 서버에게 파티방 나감을 알리는 API
    const exitFunction = async () => {
        try{
            const response = await fetch(`${API_URL}/api/chat/${userName}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include"
            })
            const data = await response.text();
            console.log(data);
        } catch (e) {
            console.log("Error : ", e);
        } finally {
            handleOpen();
        }
    }

    // 구독한 채널로부터 메세지가 왔을 때 호출되는 callback 함수
    const callback = (message) => {
        const data = JSON.parse(message.body);

        // 참가자 참여한 경우
        if (data.type === 0) {
            // 참가자 리스트에 추가
            setPartyList(prevState => [...prevState, data.sender]);
        }
        // 참가자가 나간 경우
        else if (data.type === -1) {
            // 참가자 리스트에서 삭제
            setPartyList(prevState => prevState.filter(item => item !== data.sender));
        }

        setChatLog(prevState => [...prevState, {
            sender: data.sender, time: data.time,
            chat: data.chat, type: data.type
        }]);
    }

    // 메세지 전송 시 호출되는 함수
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (message.length > 0) {
            const publishData = {
                sender: userName,
                channelId: 1,
                chat: message
            }

            // 메세지 publish하기
            client.publish({
                destination: '/pub/chat',
                body: JSON.stringify(publishData),
                headers: {}
            });

            setMessage("");
        }
    };

    // 메세지 입력 시 호출 되는 함수
    const handleKeyPress = (e) => {
        setMessage(e.target.value);
    };

    const handleExit = () => {
        exitFunction();
    }

    // 개인 정보를 보내는 함수
    const sendRegistrationNum = () => {
        const data = {info : `${frontNum}-${endNum}`};
        console.log("data : ", data);
        fetch(`${API_URL}/api/private`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        })
            .then((respones) => {
                return respones.json();
            })
            .then((data) => {
                console.log("Respond Private Data : ", data);
            })
            .catch((error) => {
                console.log(error);
            });
        setOpen(false);
    }

    useEffect(() => {
        // 서버에게 파티방 생성을 요청하는 API를 POST합니다.
        fetch(`${API_URL}/api/chat/member`, {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        })
            .then((respones) => {
                return respones.json();
            })
            .then((data) => {
                console.log("Respond Data : ", data);

                // 참가자 리스트 초기화
                const partyList = [];
                for(let i = 0; i < data.length; i++){
                    partyList.push(data[i].nickname);
                }
                setPartyList(partyList);

                client = new StompJS.Client({
                    brokerURL: BASE_URL,
                    connectHeaders: {
                        sender: userName,
                        channelId: 1
                    },
                    debug: function (str) {
                        console.log(str);
                    },
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                });

                // Fallback code
                if (typeof WebSocket !== 'function') {
                    // For SockJS you need to set a factory that creates a new SockJS instance
                    // to be used for each (re)connect
                    client.webSocketFactory = mySocketFactory();
                }

                // Fallback code
                if (typeof WebSocket !== 'function') {
                    // For SockJS you need to set a factory that creates a new SockJS instance
                    // to be used for each (re)connect
                    client.webSocketFactory = function () {
                        // Note that the URL is different from the WebSocket URL
                        return new SockJS('http://localhost:15674/stomp');
                    };
                }

                client.onConnect = function (frame) {
                    console.log(frame);
                    // Do something, all subscribes must be done is this callback
                    // This is needed because this will be executed after a (re)connect
                    subscription = client.subscribe(`/sub/chat/1`, callback, {});
                    console.log("subscribed!");
                };

                client.onStompError = function (frame) {
                    // Will be invoked in case of error encountered at Broker
                    // Bad login/passcode typically will cause an error
                    // Complaint brokers will set `message` header with a brief message. Body may contain details.
                    // Compliant brokers will terminate the connection after any error
                    console.log('Broker reported error: ' + frame.headers['message']);
                    console.log('Additional details: ' + frame.body);
                };

                client.activate();
            })
            .catch((error) => {
                console.log(`${error.name} : ${error.message}`);
            });

        return () => {
            if(client){
                client.deactivate();
                client = null;
                subscription = null;
                exitFunction();
            }
        }
    }, []);

    return (
        <Fragment>
            <Grid container sx={{width: "100%", height: "80vh"}}>
                <Grid item xs={2.7} sx={{border: "3px solid", bgcolor: "#e0f7fa"}}>
                    <List>
                        <ListItemText primary="😁 Me" sx={{px: 1.5, color: "blue"}}/>
                        <ListItem key="userName">
                            <LetterAvatar name={userName}/>
                            <ListItemText primary={userName} sx={{px: 1.5}}/>
                            <Button variant="outlined" size="small" color="error" onClick={handleExit}
                            sx={{fontSize: 20}}>
                                파티방 나가기~
                            </Button>
                        </ListItem>
                    </List>
                    <Divider sx={{border: 2}}/>
                    <ParticipantList list={partyList}/>
                </Grid>
                <Grid item xs={9.3} sx={{border: "3px solid", bgcolor: "#e1f5fe"}}>
                    <ChatLog list={chatLog} name={userName}/>
                    <Divider sx={{border: 2}}/>
                    <Box component="form" sx={{display: "flex", alignItem: "row", margin: "auto", padding: 3}}>
                        <TextField
                            fullWidth
                            label="Message"
                            value={message}
                            onChange={handleKeyPress}
                        />
                        <Button type="submit" variant="contained" color="primary" sx={{ml: 2}}
                                onClick={handleSendMessage}>
                            Send
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <Dialog open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    fullWidth={true}
                    maxWidth="sm">
                <DialogTitle>개인 정보 입력</DialogTitle>
                <DialogContent sx={{mx: 1, p:0}}>
                    <Box
                        component="form"
                        sx={{
                            '& > :not(style)': { m: 1, width: '25ch' },
                        }}
                        noValidate
                        autoComplete="off">
                        <TextField id="front" size="small" label="앞자리" variant="outlined"
                                   value={frontNum}
                                   onChange={handleInput}/>
                        <TextField id="end" size="small" label="뒷자리" type="password" variant="outlined"
                                   value={endNum}
                                   onChange={handleInput}/>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={sendRegistrationNum}>submit</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default Chat;