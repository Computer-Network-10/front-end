import './App.css';
import Chat from "./components/Chat";
import {Fragment, useState} from "react";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {Button} from "@mui/material";

function App() {
  const [userName, setUserName] = useState("User");
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (e) => {
    console.log("로그인 성공!, 유저이름 : ", userName);
    setOpen(false);
  };

  const handleKeyPress = (e) => {
    setUserName(e.target.value);
  }

  return (
      <Fragment>
        <Dialog open={open}>
          <DialogTitle sx={{fontSize: 70}}>컴퓨터 네트워크 10조 채팅방</DialogTitle>
          <DialogContent>
            <DialogContentText align="center" sx={{fontSize: 30}}>
              채팅방을 이용하려면 이름을 입력해 주세요
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                fullWidth
                variant="outlined"
                onChange={handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Submit</Button>
          </DialogActions>
        </Dialog>
        {!open && <Chat name={userName} handleOpen={handleClickOpen}/>}
      </Fragment>
  )
}

export default App;
