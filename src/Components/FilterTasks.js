import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

import Select from "react-select";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { gql, useQuery } from "@apollo/client";

const GET_TAGS = gql`
  query GetTags {
    tags {
      created_at
      id
      name
      updated_at
    }
  }
`;

const OPTIONS = [
  {
    label: "Creation Date",
    value: "created_at"
  },
  {
    label: "Start Date",
    value: "start_time"
  },
  {
    label: "End Date",
    value: "end_time"
  }
];

const useStyles = makeStyles({
  select: {
    width: "25em"
  },
  label: {
    height: "min-content",
    marginRight: "10px"
  }
});

const FilterTasks = ({ getTasks: getTaskData, taskLoading }) => {
  const classes = useStyles();
  const [filterType, setFilterType] = useState([]);
  const [sortBy, setSortBy] = useState(OPTIONS[0]);

  const { data, loading } = useQuery(GET_TAGS);
  const handleChange = newValue => {
    setFilterType(newValue);
  };
  return (
    <Grid container item xl={11} lg={11} md={11} alignItems="center">
      <Grid item>
        <Typography variant="subtitle1" className={classes.label}>
          Sort By:
        </Typography>
      </Grid>
      <Grid
        item
        style={{
          marginRight: "15px"
        }}
      >
        <Select
          className={classes.select}
          classNamePrefix="select"
          isSearchable
          placeholder="Sort by tasks"
          name="color"
          options={OPTIONS}
          value={sortBy}
          onChange={newVal => setSortBy(newVal)}
        />
      </Grid>
      {data && data.tags && (
        <>
          <Grid item>
            <Typography variant="subtitle1" className={classes.label}>
              Filter Tags:
            </Typography>
          </Grid>
          <Grid item>
            <Select
              className={classes.select}
              isMulti
              isLoading={loading}
              classNamePrefix="select"
              isSearchable
              placeholder="Filter on tags"
              name="color"
              options={data.tags.map(tag => ({
                label: tag.name,
                value: tag.id
              }))}
              value={filterType}
              onChange={handleChange}
            />
          </Grid>
        </>
      )}
      <Grid item>
        <Button
          color="primary"
          onClick={() => {
            const variables = {
              order: {
                [sortBy.value]: "desc_nulls_first"
              }
            };
            if (filterType.length) {
              variables.cond = {
                tags: {
                  _or: filterType.map(el => ({ id: { _eq: el.value } }))
                }
              };
            }
            getTaskData({ variables });
          }}
        >
          {taskLoading ? <CircularProgress size={25} /> : "Get Tasks"}
        </Button>
      </Grid>
      <Grid item>
        <Button
          color="secondary"
          onClick={() => {
            setFilterType([]);
            setSortBy(OPTIONS[0]);
            getTaskData({
              variables: {
                order: [{ created_at: "desc_nulls_first" }]
              }
            });
          }}
        >
          {taskLoading ? (
            <CircularProgress color="secondary" size={25} />
          ) : (
            "Clear Filters"
          )}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FilterTasks;
