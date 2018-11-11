#!/usr/bin/env bash
set -o errexit

# set PATH
PATH="$PATH:/opt/eosio/bin"

CONTRACTSPATH="$( pwd -P )/contracts"

# make new directory for compiled contract files
mkdir -p ./compiled_contracts
mkdir -p ./compiled_contracts/$1

COMPILEDCONTRACTSPATH="$( pwd -P )/compiled_contracts"

# unlock the wallet, ignore error if already unlocked
if [ ! -z $3 ]; then cleos wallet unlock -n $3 --password $4 || true; fi

# compile smart contract to wasm and abi files using EOSIO.CDT (Contract Development Toolkit)
# https://github.com/EOSIO/eosio.cdt
(
  eosio-cpp -abigen "$CONTRACTSPATH/$1/$1.cpp" -o "$COMPILEDCONTRACTSPATH/$1/$1.wasm" --contract "$1"
) &&

# set (deploy) compiled contract to blockchain
cleos set contract $2 "$COMPILEDCONTRACTSPATH/$1/" --permission $2

#sleep 2

cleos wallet import -n notechainwal --private-key 5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5
#cleos push action notechainacc setprofile '["useraaaaaaaa", "John Smith", "www.myprofile.com/me"]' -p useraaaaaaaa@active
#cleos push action notechainacc setproperty '["useraaaaaaaa", "1234 Some Street #3", "Tempe", "AZ", "www.myprofile.com/me", "100.0000 EOS"]' -p useraaaaaaaa@active
#cleos push action notechainacc contribute '["useraaaaaaaa", 0, "25.0000 EOS"]' -p useraaaaaaaa@active

cleos wallet import -n notechainwal --private-key 5KLqT1UFxVnKRWkjvhFur4sECrPhciuUqsYRihc1p9rxhXQMZBg
#cleos push action notechainacc contribute '["useraaaaaaab", 0, "25.0000 EOS"]' -p useraaaaaaab@active
