import React, { useState, lazy, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { gql, useLazyQuery } from "@apollo/client";
import CircularProgress from "@material-ui/core/CircularProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import FilterTasks from "./FilterTasks";

const TaskCard = lazy(() => import("./TaskCard"));
const AddTaskCard = lazy(() => import("./AddTaskCard"));

export const GET_TASK = gql`
  query GetTasks($order: [tasks_order_by!], $cond: tasks_bool_exp) {
    tasks(order_by: $order, where: $cond) {
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

const useStyles = makeStyles({
  homeRoot: {
    padding: match => (match ? "2em 10em" : "2em 0.5em")
  },
  pendingRoot: {
    paddingTop: "0.5em",
    position: "sticky",
    left: 0
  },
  cardsRoot: {
    width: "max-content"
  },
  loading: {
    height: "calc(100vh - 4em)"
  },
  horizontalScr: {
    "-ms-overflow-style": "none" /* IE and Edge */,
    "scrollbar-width": "none" /* Firefox */,
    "&::-webkit-scrollbar": {
      display: "none"
    },
    overflow: "auto"
  }
});

const Home = () => {
  const matches = useMediaQuery("(min-width: 960px)");
  const classes = useStyles(matches);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [getTasks, { data, loading, error }] = useLazyQuery(GET_TASK);
  useEffect(() => {
    getTasks({
      variables: {
        order: [{ created_at: "desc_nulls_first" }]
      }
    });
  }, []);
  const pending = [];
  const onGoing = [];
  const complete = [];
  if (data && data.tasks) {
    data.tasks.forEach(el => {
      if (el.start_time && el.end_time) {
        complete.push(el);
      } else if (el.start_time && !el.end_time) {
        onGoing.push(el);
      } else {
        pending.push(el);
      }
    });
  }

  if (error) {
    return (
      <Grid
        container
        item
        className={classes.loading}
        justify="center"
        alignContent="center"
      >
        <Typography
          variant="body1"
          color="secondary"
          style={{
            fontWeight: "bold"
          }}
        >
          There was an error. Please refresh the page.
        </Typography>
      </Grid>
    );
  }
  return (
    <Suspense fallback="">
      <Grid container item className={classes.homeRoot} direction="column">
        <Grid container item justify="space-between" wrap="nowrap">
          <FilterTasks getTasks={getTasks} taskLoading={loading} />
          <Grid item>
            <Button size="large" color="primary" onClick={e => setOpen(true)}>
              Add Task
            </Button>
          </Grid>
        </Grid>
        <Suspense fallback="">
          <AddTaskCard open={open} handleClose={handleClose} />
        </Suspense>
        {loading ? (
          <Grid
            container
            item
            className={classes.loading}
            justify="center"
            alignContent="center"
          >
            <CircularProgress />
          </Grid>
        ) : (
          <Grid
            container
            item
            direction="column"
            style={{
              height: "100%"
            }}
          >
            <Grid container item className={classes.pendingRoot}>
              <Typography variant="h5">Pending Tasks</Typography>
            </Grid>
            <Grid container item className={classes.horizontalScr}>
              <Grid container item className={classes.cardsRoot} wrap="nowrap">
                {pending.map(el => (
                  <TaskCard key={el.id} data={el} pending />
                ))}
              </Grid>
            </Grid>
            <Grid container item className={classes.pendingRoot}>
              <Typography variant="h5">Work In-Progress</Typography>
            </Grid>
            <Grid container item className={classes.horizontalScr}>
              <Grid container item className={classes.cardsRoot} wrap="nowrap">
                {onGoing.map(el => (
                  <TaskCard key={el.id} data={el} onGoing />
                ))}
              </Grid>
            </Grid>
            <Grid container item className={classes.pendingRoot}>
              <Typography variant="h5">Completed</Typography>
            </Grid>
            <Grid container item className={classes.horizontalScr}>
              <Grid container item className={classes.cardsRoot} wrap="nowrap">
                {complete.map(el => (
                  <TaskCard key={el.id} data={el} complete />
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Suspense>
  );
};

export default Home;
