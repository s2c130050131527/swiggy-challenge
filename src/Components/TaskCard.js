import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";

const useStyles = makeStyles({
  taskCardRoot: {
    width: "295px",
    margin: "10px 15px 10px 0px",
    position: "relative"
  }
});

const TaskCard = ({ data, pending, onGoing, complete }) => {
  const titleSplit = data.title.split("$$$###***");
  const classes = useStyles();
  return (
    <Card className={classes.taskCardRoot}>
      <CardHeader title={titleSplit[0]}></CardHeader>
      <CardContent>
        <Grid container item direction="column">
          {titleSplit[1] && (
            <>
              <Grid item>
                <Typography variant="body1" color="primary">
                  Description
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2">{titleSplit[1]}</Typography>
              </Grid>
            </>
          )}
          <Grid item>
            <Typography variant="body1" color="primary">
              Created By:
            </Typography>
            <Chip label={data.user.name} color="primary"></Chip>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        {pending && (
          <Button color="primary" fullWidth>
            Start Task
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
export default TaskCard;
