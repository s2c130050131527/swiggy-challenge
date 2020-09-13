import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { gql, useMutation, useQuery } from "@apollo/client";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import CreatableSelect from "react-select/creatable";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";

const ADD_TASK = gql`
  mutation AddTaskOne($type: tasks_insert_input!) {
    insert_tasks_one(object: $type) {
      created_at
      end_time
      id
      start_time
      title
      updated_at
    }
  }
`;

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

const CREATE_TAG = gql`
  mutation InsertTag($type: tags_insert_input!) {
    insert_tags_one(object: $type) {
      created_at
      id
      name
      updated_at
    }
  }
`;

const useStyles = makeStyles({
  cardRoot: {
    width: 350
  },
  tagRoot: {
    height: "100px"
  },
  chip: {
    margin: "2px"
  }
});

const AddTaskCard = ({ handleClose, open }) => {
  const classes = useStyles();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [titleErr, setTitleErr] = useState(false);
  const [addTask, { data, loading }] = useMutation(ADD_TASK);
  const [
    addTag,
    { data: createdTagData, loading: addTagLoading }
  ] = useMutation(CREATE_TAG);
  const {
    loading: tagLoading,
    error,
    data: tagData,
    refetch: tagRefetch
  } = useQuery(GET_TAGS);
  const [selectVal, setSelectVal] = useState([]);
  const createOption = label => ({
    label,
    value: label.toLowerCase().replace(/\W/g, "")
  });
  const handleChange = newValue => {
    const newValues = [...selectVal];
    newValues.push(newValue);
    setSelectVal(newValues);
  };
  const handleCreate = inputValue => {
    const newOption = createOption(inputValue);
    console.log(newOption);
    addTag({
      variables: {
        type: {
          name: inputValue
        }
      },
      refetchQueries: ["GetTags"]
    });
    const newValues = [...selectVal];
    newValues.push(newOption);
    setSelectVal(newValues);
  };
  return (
    <Dialog open={open} maxWidth="sm" onEscapeKeyDown={handleChange}>
      <form
        onSubmit={e => {
          e.preventDefault();
          debugger;
          if (!title) {
            setTitleErr(true);
            return;
          }
          addTask({
            variables: {
              type: {
                title: `${title}$$$###***${desc}`,
                task_tags: {
                  data: selectVal.map(el => {
                    const tag = tagData.tags.find(
                      el1 =>
                        el1.name.toLowerCase().replace(/\W/g, "") === el.value
                    );
                    return { tag_id: tag.id };
                  })
                }
              }
            }
            // refetchQueries: ["GetTasks"]
          });
        }}
      >
        <DialogTitle title="Add new task" />
        <DialogContent
          style={{
            height: "24em"
          }}
        >
          <TextField
            autoFocus
            value={title}
            onChange={e => {
              setTitleErr(false);
              setTitle(e.target.value);
            }}
            margin="dense"
            id="title"
            label="Add a title"
            type="text"
            fullWidth
            error={titleErr}
            helperText={titleErr && "Title is mandatory"}
          />
          <TextField
            value={desc}
            onChange={e => setDesc(e.target.value)}
            margin="dense"
            id="desc"
            multiline
            rows={3}
            label="Add a description (optional)"
            type="textarea"
            fullWidth
          />
          <Typography variant="subtitle2">Select Tags</Typography>
          <CreatableSelect
            isDisabled={tagLoading}
            maxMenuHeight={100}
            isLoading={tagLoading}
            placeholder="Select Tags"
            onChange={handleChange}
            classNamePrefix="create-select"
            onCreateOption={handleCreate}
            options={
              tagData
                ? tagData.tags
                    .map(el => createOption(el.name))
                    .filter(
                      el =>
                        selectVal.findIndex(el1 => el1.value === el.value) ===
                        -1
                    )
                : []
            }
            value={{}}
          />
          <Grid container item className={classes.tagRoot}>
            {selectVal.map((el, index) => (
              <Chip
                key={el.value}
                label={el.label}
                onDelete={() => {
                  const newSelectVal = [...selectVal];
                  newSelectVal.splice(index, 1);
                  setSelectVal(newSelectVal);
                }}
                color="secondary"
                className={classes.chip}
              />
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            fullWidth
            type="button"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button color="primary" fullWidth type="submit">
            Save Task
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTaskCard;
