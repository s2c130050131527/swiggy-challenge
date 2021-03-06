import React, { useEffect, useState, lazy, Suspense } from "react";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import { gql, useMutation } from "@apollo/client";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { GET_TASK } from "./Home";

const EditTaskCard = lazy(() => import("./EditTaskCard"));
const UPDATE_TASK = gql`
  mutation UpdateTask($change: tasks_set_input, $id: tasks_pk_columns_input!) {
    update_tasks_by_pk(_set: $change, pk_columns: $id) {
      created_at
      end_time
      id
      start_time
      tags {
        name
        id
      }
      title
      updated_at
      user {
        name
      }
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTasks($id: Int!) {
    delete_tasks_by_pk(id: $id) {
      id
    }
  }
`;
const useStyles = makeStyles({
  taskCardRoot: {
    width: "350px",
    margin: "10px 15px 10px 0px",
    position: "relative"
  },
  row: {
    marginTop: "5px"
  },
  tag: {
    marginRight: "4px",
    marginTop: "3px"
  }
});

const TaskCard = ({ data, pending, onGoing, complete }) => {
  const titleSplit = data.title.split("$$$###***");
  const classes = useStyles();
  const [updateTask, { loading: updateLoading }] = useMutation(UPDATE_TASK);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [editTask, setEditTask] = useState(false);
  const [deleteTask, deleteTaskData] = useMutation(DELETE_TASK);
  const handleEditClose = () => setEditTask(false);
  useEffect(() => {
    if (onGoing) {
      setInterval(() => {
        setTimeElapsed(
          new Date().getTime() - new Date(data.start_time).getTime()
        );
      }, 1000);
    }
  }, [onGoing]);

  const calcDiff = ts => {
    ts = parseInt(ts / 1000);
    let minutes = parseInt(ts / 60);
    const secs = ts % 60;
    const hours = parseInt(minutes / 60);
    minutes = minutes % 60;
    let res = "";
    if (hours) {
      res += hours + " hour(s) ";
    }
    res += minutes + " minute(s) " + secs + " sec(s)";
    return res;
  };
  const updateStart = () => {
    const ts = new Date().toUTCString();
    const change = {
      start_time: ts
    };
    const id = {
      id: data.id
    };
    updateTask({
      variables: {
        change,
        id
      }
    });
  };
  const updateEnd = () => {
    const ts = new Date().toUTCString();
    const change = {
      end_time: ts
    };
    const id = {
      id: data.id
    };
    updateTask({
      variables: {
        change,
        id
      }
    });
  };
  const handleDelete = () => {
    deleteTask({
      variables: {
        id: data.id
      },
      update: cache => {
        const existingTasks = cache.readQuery({ query: GET_TASK });
        const newTasks = existingTasks.tasks.filter(t => t.id !== data.id);
        cache.writeQuery({
          query: GET_TASK,
          data: { tasks: newTasks }
        });
      }
    });
  };
  return (
    <Card className={classes.taskCardRoot}>
      <Suspense fallback="">
        {editTask && (
          <EditTaskCard
            id={data.id}
            title={titleSplit[0]}
            desc={titleSplit[1]}
            tags={data.tags}
            handleClose={handleEditClose}
          />
        )}
      </Suspense>
      <CardHeader
        title={titleSplit[0]}
        action={
          <>
            <IconButton
              color="primary"
              title="Edit Task"
              onClick={() => setEditTask(true)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="secondary"
              title="Delete Task"
              onClick={handleDelete}
            >
              {deleteTaskData.loading ? (
                <CircularProgress size={25} color="secondary" />
              ) : (
                <DeleteIcon />
              )}
            </IconButton>
          </>
        }
      ></CardHeader>
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
          <Grid container item className={classes.row}>
            <Typography variant="body1" color="primary">
              Created By:
            </Typography>
            <Chip label={data.user.name} color="primary" size="small"></Chip>
          </Grid>
          {data.tags.length >= 1 && (
            <Grid item className={classes.row}>
              <Typography variant="body1" color="primary">
                Tags:
              </Typography>
              {data.tags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  color="primary"
                  size="small"
                  className={classes.tag}
                ></Chip>
              ))}
            </Grid>
          )}
          {onGoing && (
            <Grid container item className={classes.row}>
              <Typography variant="body1" color="primary">
                Time Elapsed:
              </Typography>
              <Chip
                label={calcDiff(timeElapsed)}
                size="small"
                color="primary"
              ></Chip>
            </Grid>
          )}
          {complete && (
            <Grid container item className={classes.row}>
              <Typography variant="body1" color="primary">
                Task Duration:
              </Typography>
              <Chip
                label={calcDiff(
                  new Date(data.end_time) - new Date(data.start_time)
                )}
                size="small"
                color="primary"
              ></Chip>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions>
        {pending && (
          <Button
            color="primary"
            fullWidth
            onClick={updateStart}
            disabled={updateLoading}
          >
            Start Task
          </Button>
        )}
        {onGoing && (
          <Button
            color="secondary"
            fullWidth
            onClick={updateEnd}
            disabled={updateLoading}
          >
            End Task
          </Button>
        )}
        {}
      </CardActions>
    </Card>
  );
};
export default TaskCard;
