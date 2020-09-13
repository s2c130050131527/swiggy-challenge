import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { gql, useMutation, useQuery } from "@apollo/client";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import CreatableSelect from "react-select/creatable";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";

const UPDATE_TASK = gql`
  mutation UpdateTasks($type: tasks_set_input, $id: tasks_pk_columns_input!) {
    update_tasks_by_pk(_set: $type, pk_columns: $id) {
      created_at
      end_time
      id
      start_time
      tags {
        id
        name
      }

      title
      updated_at
      user {
        name
      }
    }
  }
`;

const DELETE_TASK_TAG = gql`
  mutation DeleteTaskTag($tag: Int!, $task: Int!) {
    delete_task_tag_by_pk(tag_id: $tag, task_id: $task) {
      tag_id
      task_id
    }
  }
`;
const INSERT_TASK_TAG = gql`
  mutation InsertTaskTag($type: task_tag_insert_input!) {
    insert_task_tag_one(object: $type) {
      tag_id
      tag {
        name
        id
      }
      task_id
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

const EditTaskCard = ({
  handleClose,
  title: titleOriginal,
  desc: description,
  tags,
  id
}) => {
  console.log(tags);
  const classes = useStyles();
  const [title, setTitle] = useState(titleOriginal);
  const [desc, setDesc] = useState(description);
  const [titleErr, setTitleErr] = useState(false);
  const [updateTask, { data, loading }] = useMutation(UPDATE_TASK);
  const [deleteTaskTag, deleteTagData] = useMutation(DELETE_TASK_TAG);
  const [insertTaskTag, insertTagData] = useMutation(INSERT_TASK_TAG);

  const [
    addTag,
    { data: createdTagData, loading: addTagLoading }
  ] = useMutation(CREATE_TAG);
  useEffect(() => {
    if (!addTagLoading && createdTagData) {
      insertTaskTag({
        variables: {
          type: {
            tag_id: createdTagData.insert_tags_one.id,
            task_id: id
          }
        }
      });
    }
  }, [createdTagData]);
  const {
    loading: tagLoading,
    error,
    data: tagData,
    refetch: tagRefetch
  } = useQuery(GET_TAGS);
  if (data) {
    handleClose();
  }
  const createOption = label => ({
    label,
    value: label.toLowerCase().replace(/\W/g, "")
  });
  const [selectVal, setSelectVal] = useState(
    tags.map(tag => createOption(tag.name))
  );
  const handleChange = newValue => {
    const newValues = [...selectVal];
    newValues.push(newValue);
    const tag = tagData.tags.find(
      el1 => el1.name.toLowerCase().replace(/\W/g, "") === newValue.value
    );
    if (tag) {
      insertTaskTag({
        variables: {
          type: {
            tag_id: tag.id,
            task_id: id
          }
        }
      });
    }
    setSelectVal(newValues);
  };
  const handleCreate = inputValue => {
    const newOption = createOption(inputValue);
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
    <Dialog open maxWidth="sm" onEscapeKeyDown={handleChange}>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!title) {
            setTitleErr(true);
            return;
          }
          updateTask({
            variables: {
              type: {
                title: `${title}$$$###***${desc}`
              },
              id: {
                id
              }
            }
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
            label="Edit title"
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
            label="Edit description"
            type="text"
            fullWidth
          />
          <Typography variant="subtitle2">Select Tags</Typography>
          <CreatableSelect
            isDisabled={tagLoading || addTagLoading}
            maxMenuHeight={100}
            isLoading={tagLoading || addTagLoading}
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
                  const tag = tags.find(
                    el1 =>
                      el1.name.toLowerCase().replace(/\W/g, "") === el.value
                  );
                  deleteTaskTag({
                    variables: {
                      tag: tag.id,
                      task: id
                    }
                  });
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
          <Button color="primary" fullWidth type="submit" disabled={loading}>
            {loading ? <CircularProgress size={25} /> : "Update Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditTaskCard;
