import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { useDispatch } from "react-redux";
import { setTokenAction } from "../Store/Reducers/token";

const useStyles = makeStyles({
  headerRoot: {
    height: "4em",
    backgroundColor: "#fff",
    padding: "0.5em 10em",
    boxShadow: "0px 3px 6px rgba(0,0,0,0.3)"
  }
});

const Header = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [token, setToken] = useState("");
  const dispatch = useDispatch();
  return (
    <Grid
      container
      item
      className={classes.headerRoot}
      justify="space-between"
      alignContent="center"
      wrap="nowrap"
    >
      <Grid container item>
        <Typography variant="h4">Taskify</Typography>
      </Grid>
      <Grid container item justify="flex-end">
        <Button color="primary" onClick={handleOpen}>
          Set Token
        </Button>
      </Grid>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Set Token</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set Token Generated from gql For Eg: `Bearer your_token`
          </DialogContentText>
          <TextField
            autoFocus
            value={token}
            onChange={e => setToken(e.target.value)}
            margin="dense"
            id="name"
            label="Token"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch(setTokenAction(token));
              handleClose();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Header;
