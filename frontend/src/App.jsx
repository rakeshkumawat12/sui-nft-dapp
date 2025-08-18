import "./App.css";

import React, { useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQuery } from "@tanstack/react-query";

export default function App() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: nfts, isLoading } = useQuery({
    queryKey: ["nfts", account?.address],
    queryFn: () =>
      client.getOwnedObjects({
        owner: account.address,
        options: { showContent: true },
      }),
    enabled: !!account,
  });

  const handleMint = async () => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `0x7eda725081b0175a02234c5aba12128d17a6c2b6493abfcc30a7000942b1b13f::my_nft::mint`,
        arguments: [
          tx.pure.string(name),
          tx.pure.string(desc),
          tx.pure.string(imageUrl),
        ],
      });
      await signAndExecute({ transaction: tx });
    } catch (error) {
      console.error("Error minting loyalty card:", error);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>
        Sui NFT Minting dApp
      </h1>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <ConnectButton />
        {account && (
          <p style={{ marginTop: 10, color: "#555", fontSize: 14 }}>
            Connected:{" "}
            <span style={{ fontWeight: "bold" }}>{account.address}</span>
          </p>
        )}
      </div>

      {account && (
        <div style={{
            margin: "100px auto",
            maxWidth: 400,
            padding: 30,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            
          }}>
          <h2 style={{ margin: "0 0 15px 0", color: "#444" }}>Mint a New NFT</h2>
          <input
            type="text"
            placeholder="NFT Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          <input
            type="text"
            placeholder="NFT Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 15,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          <button onClick={handleMint}
          style={{
              width: "100%",
              padding: 12,
              background: "#6a5acd",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}>Mint NFT</button>
        </div>
      )}

      {account && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 20, color: "#444" }}>My NFTs</h2>
          {isLoading && <p>Loading NFTs...</p>}

          {!isLoading && nfts?.data?.length === 0 && <p>No NFTs found.</p>}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {nfts?.data?.map((nft, idx) => {
              const content = nft?.data?.content?.fields;
              return (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    width: 220,
                    background: "white",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <img
                    src={content?.image_url || "https://placehold.co/200"}
                    alt={content?.name}
                    style={{ width: "100%", height: 160, objectFit: "cover" }}
                  />

                  <div style={{ padding: 12 }}>
                    <h4 style={{ margin: "0 0 8px", color: "#333" }}>
                      {content?.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                      {content?.description}
                    </p>
                  </div>


                  {/* <h4>{content?.name}</h4>
                  <p>{content?.description}</p> */}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
