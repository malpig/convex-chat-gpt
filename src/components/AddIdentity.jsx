import React, { useState } from "react";
import { useAction } from "../../convex/_generated/react";

export function AddIdentity() {
  const addIdentity = useAction("openai:moderateIdentity");
  const [newIdentityName, setNewIdentityName] = useState("");
  const [newIdentityInstructions, setNewIdentityInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  return (
    <section>
      <details open={false}>
        <summary>Add an identity</summary>
        {error}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const errorMsg = await addIdentity({
              name: newIdentityName,
              instructions: newIdentityInstructions,
            });
            if (errorMsg) setError(errorMsg);
            setLoading(false);
            setNewIdentityName("");
            setNewIdentityInstructions("");
          }}
        >
          <input
            value={newIdentityName}
            onChange={(event) => setNewIdentityName(event.target.value)}
            placeholder="Identity Name"
          />
          <textarea
            value={newIdentityInstructions}
            onChange={(event) => setNewIdentityInstructions(event.target.value)}
            placeholder="GPT3 Instructions"
            rows={2}
            cols={40}
          />
          <input
            type="submit"
            value="Add Identity"
            disabled={loading || !newIdentityName || !newIdentityInstructions}
          />
        </form>
      </details>
    </section>
  );
}
