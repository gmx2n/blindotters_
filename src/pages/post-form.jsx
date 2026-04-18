import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function PostForm() {
  const createPost = useMutation(api.posts.createPost);
  const navigate = useNavigate();

  const [items, setItems] = useState([
    { name: "", quantity: 1, expiration: "" },
  ]);

  const addItem = () => {
    if (items.length >= 15) return;

    setItems([...items, { name: "", quantity: 1, expiration: "" }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // send entire array to backend
    await createPost({
      items,
    });

    navigate("/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 m-6"
    >
      <div className="text-lg font-semibold">
        Your groceries
      </div>

      {items.map((item, index) => (
        <fieldset
          key={index}
          className="fieldset bg-base-200 border-base-300 rounded-box border p-4 m-2 flex"
        >
          <legend className="fieldset-legend">
            Item {index + 1}
          </legend>

          {/* Name */}
          <input
            type="text"
            className="input"
            placeholder="Name of item"
            value={item.name}
            onChange={(e) =>
              updateItem(index, "name", e.target.value)
            }
          />

          {/* Quantity */}
          <input
            type="number"
            className="input"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              updateItem(index, "quantity", Number(e.target.value))
            }
          />

          {/* Expiration */}
          <input
            type="date"
            className="input"
            value={item.expiration}
            onChange={(e) =>
              updateItem(index, "expiration", e.target.value)
            }
          />

          {/* Remove */}
          <button
            type="button"
            className="btn btn-error btn-sm mt-2"
            onClick={() => removeItem(index)}
          >
            Remove
          </button>
        </fieldset>
      ))}

      {/* Add item */}
      <div className="flex">
        <button
          type="button"
          className="btn btn-primary mx-4"
          onClick={addItem}
          disabled={items.length >= 15}
        >
          Add another item
        </button>

        {/* Submit */}
        <button type="submit" className="btn btn-success mx-4">
          Add to fridge
        </button>
      </div>
    </form>
  );
}