const { errors: rpcErrors } = require('eth-json-rpc-errors')

const Secp256k1 = require('secp256k1');
const bech32 = require('bech32')
const Sha256 = require('sha256');
const RIPEMD160 = require('ripemd160');

wallet.updatePluginState({
  nodeUrl: "https://devnet.cybernode.ai",
  denom: "eul",
  prefix: "cyber",
  memo: "sent from metamask's cyb snap!",
  gas: 0,
  version: "1.0.0"
})

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  let pubKey, account;

  switch (requestObject.method) {
    case 'getSnapState':
      return wallet.getPluginState()
    case 'setConfig':
      wallet.updatePluginState({
        ...currentPluginState,
        nodeUrl: requestObject[0]['nodeUrl'],
        denom: requestObject[0]['denom'],
        prefix: requestObject[0]['prefix'],
        memo: requestObject[0]['memo'],
        gas: requestObject[0]['gas'],
      })
      return wallet.getPluginState()
    case 'getAccount':
      pubKey = await getPubKey()
      return getAccount(pubKey)
    case 'getAccountInfo':
      pubKey = await getPubKey()
      account = getAccount(pubKey)
      return await getAccountInfo(account)
    case 'getStatus':
      return getStatus()
    case 'getBandwidth':
      pubKey = await getPubKey()
      account = getAccount(pubKey)
      return await getAccountBandwidth(account)
    case 'getIndexStats':
      return await getIndexStats()
    case 'getRewards':
      pubKey = await getPubKey()
      account = getAccount(pubKey)
      return await getRewards(account)
    case 'createCyberlink':
      let linkData = requestObject.params[0]
      return await createCyberlinkTx(
        linkData['objectFrom'],
        linkData['objectTo']
      )
    case 'createSend':
      let sendData = requestObject.params[0]
      return await createSendTx(
        sendData['subjectTo'],
        sendData['amount']
      )
    case 'createMultiSend':
      let multiSendData = requestObject.params[0]
      return await createMultiSendTx(
        multiSendData['inputs'],
        multiSendData['outputs']
      )
    case 'createDelegate':
      let delegateData = requestObject.params[0]
      return await createDelegateTx(
        delegateData['validatorTo'],
        delegateData['amount']
      )
    case 'createRedelegate':
      let redelegateData = requestObject.params[0]
      return await createRedelegateTx(
        redelegateData['validatorFrom'],
        redelegateData['validatorTo'],
        redelegateData['amount']
      )
    case 'createUndelegate':
      let undelegateData = requestObject.params[0]
      return await createUndelegateTx(
        undelegateData['validatorFrom'],
        undelegateData['amount']
      )
      case 'createWithdrawDelegationReward':
        let withdrawDelegationReward = requestObject.params[0]
        return await createWithdrawDelegationRewardTx(
          withdrawDelegationReward['rewards']
        )
    case 'createTextProposal':
      let textProposalData = requestObject.params[0]
      return await createTextProposalTx(
        textProposalData['title'],
        textProposalData['description'],
        textProposalData['deposit']
      )
    case 'createCommunityPoolSpend':
      let communitySpendProposalData = requestObject.params[0]
      return await createCommunityPoolSpendProposalTx(
        communitySpendProposalData['title'],
        communitySpendProposalData['description'],
        communitySpendProposalData['recipient'],
        communitySpendProposalData['deposit'],
        communitySpendProposalData['amount']
      )
    case 'createParamsChangeProposal':
      let paramsChangeProposalData = requestObject.params[0]
      return await createParamsChangeProposalTx(
        paramsChangeProposalData['title'],
        paramsChangeProposalData['description'],
        paramsChangeProposalData['changes'],
        paramsChangeProposalData['deposit']
      )
    case 'createDeposit':
      let depositData = requestObject.params[0]
      return await createDepositTx(
        depositData['proposalId'],
        depositData['amount']
      )
    case 'createVote':
      let voteData = requestObject.params[0]
      return await createVoteTx(
        voteData['proposalId'],
        voteData['option']
      )

    default:
      throw rpcErrors.methodNotFound(requestObject)
  }
})

//----------------------------------------------------------

async function getPubKey () {
  const PRIV_KEY = await wallet.getAppKey()
  const prikeyArr = new Uint8Array(hexToBytes(PRIV_KEY));
  return bytesToHex(Secp256k1.publicKeyCreate(prikeyArr, true))
}

function getAccount (pubkey) {
  const currentPluginState = wallet.getPluginState()
  const address = getAddress(hexToBytes(pubkey))
  return toBech32(currentPluginState.prefix, address)
}

function getAddress(pubkey) {
  if (pubkey.length > 33) {
    pubkey = pubkey.slice(5, pubkey.length);
  }
  const hmac = Sha256(pubkey);
  const b = Buffer.from(hexToBytes(hmac));
  const addr = new RIPEMD160().update(b);

  return addr.digest('hex').toUpperCase();
}

//----------------------------------------------------------

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function toBech32(prefix, str) {
  const strByte = bech32.toWords(Buffer.from(str, 'hex'));

  return bech32.encode(prefix, strByte);
}

function bytesToHex(bytes) {
  const hex = [];

  for (let i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] >>> 4).toString(16));
      hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join('').toUpperCase();
}

//----------------------------------------------------------

async function getNetworkId() {
  const data = await getStatus();
  return data.node_info.network;
}

async function getAccountInfo(address) {
  const currentPluginState = wallet.getPluginState()
  try {
    const response = await fetch(`${currentPluginState.nodeUrl}/api/account?address="${address}"`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });  
    
    const accountInfo = await response.json();
    if(!accountInfo.result) { throw error };

    let account = accountInfo.result.account;
    if(!account) { throw error };

    const chainId = await getNetworkId();
    account.chainId = chainId;

    return account
  } catch (error) {
      console.error(error);
  }
}

async function getAccountBandwidth(address) {
  const currentPluginState = wallet.getPluginState()
  try {
    const bandwidth = {
      remained: 0,
      max_value: 0,
    };

    const response = await fetch(
      `${currentPluginState.nodeUrl}/api/account_bandwidth?address="${address}"`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    bandwidth.remained = data.result.remained;
    bandwidth.max_value = data.result.max_value;

    return bandwidth
  } catch (error) {
    console.error(error)
  }
}

async function getStatus() {
  const currentPluginState = wallet.getPluginState()
  try {
    const response = await fetch(`${currentPluginState.nodeUrl}/api/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if(!data.result.node_info) { throw error };

    return data.result;
  } catch (error) {
    console.error(error)
  }
}

async function getIndexStats() {
  const currentPluginState = wallet.getPluginState()
  try {
    const response = await fetch(`${currentPluginState.nodeUrl}/api/index_stats`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if(!data.result) { throw error };

    return data.result;
  } catch (error) {
    console.error(error)
  }
}

async function getRewards(address) {
  const currentPluginState = wallet.getPluginState()
  try {
    const response = await fetch(`${currentPluginState.nodeUrl}/lcd/distribution/delegators/${address}/rewards`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if(!data.result.rewards) { throw error };

    return data.result.rewards;
  } catch (error) {
    console.error(error)
  }
}


//----------------------------------------------------------

// TODO refactor to universal skeleton
const createSkeleton = (txContext, denom) => {
  if (typeof txContext === 'undefined') {
    throw new Error('undefined txContext');
  }
  if (typeof txContext.accountNumber === 'undefined') {
    throw new Error('txContext does not contain the accountNumber');
  }
  if (typeof txContext.sequence === 'undefined') {
    throw new Error('txContext does not contain the sequence value');
  }
  const currentPluginState = wallet.getPluginState()
  const txSkeleton = {
    type: 'auth/StdTx',
    value: {
      msg: [], // messages
      fee: '',
      memo: currentPluginState.memo,
      signatures: [
        {
          signature: 'N/A',
          account_number: txContext.accountNumber.toString(),
          sequence: txContext.sequence.toString(),
          pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: 'PK',
          },
        },
      ],
    },
  };
  return applyGas(txSkeleton, currentPluginState.gas, denom);
};

function applyGas(unsignedTx, gas, denom) {
  if (typeof unsignedTx === 'undefined') {
    throw new Error('undefined unsignedTx');
  }
  if (typeof gas === 'undefined') {
    throw new Error('undefined gas');
  }

  unsignedTx.value.fee = {
    amount: [
      {
        amount: '0', // TODO apply fee for cosmos support
        denom: denom,
      },
    ],
    gas: gas.toString(),
  };

  return unsignedTx;
}

async function createTxContext() {
  const pubKey = await getPubKey()
  const account = getAccount(pubKey)
  const accountInfo = await getAccountInfo(account)

  const currentPluginState = wallet.getPluginState()

  const txContext = {
    accountNumber: accountInfo.account_number,
    chainId: accountInfo.chainId,
    sequence: accountInfo.sequence,
    bech32: account,
    memo: currentPluginState.memo,
    pk: pubKey.toString('hex'),
  };
  
  return txContext
}

//----------------------------------------------------------

function createCyberlink(txContext, objectFrom, objectTo, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cyberd/Link',
    value: {
      address: txContext.bech32,
      links: [
        {
          from: objectFrom,
          to: objectTo,
        },
      ],
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createSend(txContext, recipient, amount, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgSend',
    value: {
      amount: [
        {
          amount: amount.toString(),
          denom: denom,
        },
      ],
      from_address: txContext.bech32,
      to_address: recipient,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createMultiSend(txContext, inputs, outputs, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgMultiSend',
    value: {
      inputs: inputs,
      outputs: outputs,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createDelegate(txContext, validatorBech32, amount, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgDelegate',
    value: {
      amount: {
        amount: amount.toString(),
        denom: denom,
      },
      delegator_address: txContext.bech32,
      validator_address: validatorBech32,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createRedelegate(txContext, validatorSourceBech32, validatorDestBech32, amount, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    value: {
      amount: {
        amount: amount.toString(),
        denom: denom,
      },
      delegator_address: txContext.bech32,
      validator_src_address: validatorSourceBech32,
      validator_dst_address: validatorDestBech32,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createUndelegate(txContext, validatorBech32, amount, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgUndelegate',
    value: {
      amount: {
        amount: amount.toString(),
        denom: denom,
      },
      delegator_address: txContext.bech32,
      validator_address: validatorBech32,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createWithdrawDelegationReward(txContext, rewards, denom) {
  const txSkeleton = createSkeleton(txContext, denom);
  txSkeleton.value.msg = [];

  Object.keys(rewards).forEach(key => {
    txSkeleton.value.msg.push({
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        delegator_address: txContext.bech32,
        validator_address: rewards[key].validator_address,
      },
    });
  });

  return txSkeleton;
}

function createTextProposal(txContext, title, description, deposit, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgSubmitProposal',
    value: {
      content: {
        type: 'cosmos-sdk/TextProposal',
        value: {
          title: title,
          description: description,
        },
      },
      initial_deposit: [{
        amount: deposit.toString(),
        denom: denom,
      }],
      proposer: txContext.bech32,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createCommunityPoolSpendProposal(txContext, title, description, recipient, deposit, amount, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgSubmitProposal',
    value: {
      content: {
        type: 'cosmos-sdk/CommunityPoolSpendProposal',
        value: {
          title: title,
          description: description,
          recipient: recipient,
          amount: [{
            amount: amount.toString(),
            denom: denom,
          }],
        },
      },
      initial_deposit: [{
        amount: deposit.toString(),
        denom: denom,
      }],
      proposer: txContext.bech32,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createParamsChangeProposal(txContext, title, description, changes, deposit, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgSubmitProposal',
    value: {
      content: {
        type: 'cosmos-sdk/ParameterChangeProposal',
        value: {
          title: title,
          description: description,
          changes: changes,
        },
      },
      initial_deposit: [{
        amount: deposit.toString(),
        denom: denom,
      }],
      proposer: txContext.bech32,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createDeposit(txContext, proposalId, amount, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgDeposit',
    value: {
      proposal_id: proposalId,
      depositor: txContext.bech32,
      amount: [{
        amount: amount.toString(),
        denom: denom,
    }],
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

function createVote(txContext, proposalId, option, denom) {
  const txSkeleton = createSkeleton(txContext, denom);

  const txMsg = {
    type: 'cosmos-sdk/MsgVote',
    value: {
      proposal_id: proposalId,
      voter: txContext.bech32,
      option: option,
    },
  };

  txSkeleton.value.msg = [txMsg];

  return txSkeleton;
}

//----------------------------------------------------------

async function createCyberlinkTx (objectFrom, objectTo) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createCyberlink(
    txContext,
    objectFrom,
    objectTo,
    currentPluginState.denom
  );

  const signedTx = await sign(tx, txContext);
  return await txSubmit(signedTx)
  // return signedTx
};

async function createSendTx(subjectTo, amount) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createSend(
    txContext,
    subjectTo,
    amount,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createMultiSendTx(inputs, outputs) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createMultiSend(
    txContext,
    JSON.parse(inputs),
    JSON.parse(outputs),
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createDelegateTx(validatorTo, amount) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createDelegate(
    txContext,
    validatorTo,
    amount,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function  createRedelegateTx(validatorFrom, validatorTo, amount) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createRedelegate(
    txContext,
    validatorFrom,
    validatorTo,
    amount,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createUndelegateTx(validatorFrom, amount) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createUndelegate(
    txContext,
    validatorFrom,
    amount,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createWithdrawDelegationRewardTx(rewards) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createWithdrawDelegationReward(
    txContext,
    JSON.parse(rewards),
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
}

async function createTextProposalTx(title, description, deposit) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createTextProposal(
    txContext,
    title,
    description,
    deposit,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createCommunityPoolSpendProposalTx(title, description, recipient, deposit, amount) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createCommunityPoolSpendProposal(
    txContext,
    title,
    description,
    recipient,
    deposit,
    amount,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createParamsChangeProposalTx(title, description, changes, deposit) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createParamsChangeProposal(
    txContext,
    title,
    description,
    JSON.parse(changes),
    deposit,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createDepositTx(proposalId, amount) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createDeposit(
    txContext,
    proposalId,
    amount,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

async function createVoteTx(proposalId, option) {
  const txContext = await createTxContext()
  const currentPluginState = wallet.getPluginState()

  const tx = await createVote(
    txContext,
    proposalId,
    option,
    currentPluginState.denom
  );
  
  const signedTx = await sign(tx, txContext);
  return txSubmit(signedTx)
  // return signedTx
};

//----------------------------------------------------------

async function txSubmit(signedTx) {
  const txBody = {
    tx: signedTx.value,
    mode: 'sync',
  };
  const currentPluginState = wallet.getPluginState()
  const url = `${currentPluginState.nodeUrl}/lcd/txs`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(txBody),
  })
  const result = await response.json()
  if (result.error) {
    throw new Error(result.error)
  }
  return result
}

//----------------------------------------------------------

async function sign(unsignedTx, txContext) {
  const bytesToSign = getBytesToSign(unsignedTx, txContext);
  const PRIV_KEY = await wallet.getAppKey()
  
  const hash = new Uint8Array(Sha256(Buffer.from(bytesToSign), {
    asBytes: true 
  }));
  const prikeyArr = new Uint8Array(hexToBytes(PRIV_KEY));
  const sig = Secp256k1.ecdsaSign(hash, prikeyArr);

  return applySignature(unsignedTx, txContext, Array.from(sig.signature));
}

function getBytesToSign(tx, txContext) {
  if (typeof txContext === 'undefined') {
    throw new Error('txContext is not defined');
  }
  if (typeof txContext.chainId === 'undefined') {
    throw new Error('txContext does not contain the chainId');
  }
  if (typeof txContext.accountNumber === 'undefined') {
    throw new Error('txContext does not contain the accountNumber');
  }
  if (typeof txContext.sequence === 'undefined') {
    throw new Error('txContext does not contain the sequence value');
  }

  const txFieldsToSign = {
    account_number: txContext.accountNumber.toString(),
    chain_id: txContext.chainId,
    fee: tx.value.fee,
    memo: tx.value.memo,
    msgs: tx.value.msg,
    sequence: txContext.sequence.toString(),
  };

  return JSON.stringify(removeEmptyProperties(txFieldsToSign));
}

function removeEmptyProperties (jsonTx) {
  if (Array.isArray(jsonTx)) {
    return jsonTx.map(removeEmptyProperties)
  }

  if (typeof jsonTx !== `object`) {
    return jsonTx
  }

  const sorted = {}
  Object.keys(jsonTx)
    .sort()
    .forEach(key => {
      if (jsonTx[key] === undefined || jsonTx[key] === null) return
      sorted[key] = removeEmptyProperties(jsonTx[key])
    })
  return sorted
}

function applySignature(unsignedTx, txContext, secp256k1Sig) {
  if (typeof unsignedTx === 'undefined') {
    throw new Error('undefined unsignedTx');
  }
  if (typeof txContext === 'undefined') {
    throw new Error('undefined txContext');
  }
  if (typeof txContext.pk === 'undefined') {
    throw new Error('txContext does not contain the public key (pk)');
  }
  if (typeof txContext.accountNumber === 'undefined') {
    throw new Error('txContext does not contain the accountNumber');
  }
  if (typeof txContext.sequence === 'undefined') {
    throw new Error('txContext does not contain the sequence value');
  }

  const tmpCopy = Object.assign({}, unsignedTx, {});

  tmpCopy.value.signatures = [
    {
      signature: Buffer.from(secp256k1Sig).toString('base64'),
      account_number: txContext.accountNumber.toString(),
      sequence: txContext.sequence.toString(),
      pub_key: {
        type: 'tendermint/PubKeySecp256k1',
        value: Buffer.from(hexToBytes(txContext.pk)).toString('base64'),
      },
    },
  ];
  return tmpCopy;
}