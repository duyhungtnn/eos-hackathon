#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <time.h>

using namespace eosio;

// Smart Contract Name: notechain
// Table struct:
//   notestruct: multi index table to store the notes
//     prim_key(uint64): primary key
//     user(name): account name for the user
//     note(string): the note message
//     timestamp(uint64): the store the last update block time
// Public method:
//   isnewuser => to check if the given account name has note in table or not
// Public actions:
//   update => put the note into the multi-index table and sign by the given account

// Replace the contract class name when you start your own project
CONTRACT notechain : public eosio::contract {
  private:

    TABLE profile {
      uint64_t prim_key;
      name user;
      std::string fullname;
      std::string photo_url;
      uint64_t timestamp;

      auto primary_key() const { return prim_key; }
      uint64_t get_by_user() const { return user.value; }
    };

    TABLE property {
      uint64_t prim_key;
      name user;
      std::string address;
      std::string city;
      std::string state;
      std::string photo_url;
      uint8_t fulfilled;
      uint64_t timestamp;

      auto primary_key() const { return prim_key; }
      uint64_t get_by_user() const { return user.value; }
    };

    TABLE staker {
      uint64_t prim_key;
      name user;
      asset quantity;
      uint64_t timestamp;

      auto primary_key() const { return prim_key; }
      uint64_t get_by_user() const { return user.value; }
    };


    // create a multi-index table and support secondary key
    typedef eosio::multi_index< name("profiles"), profile,
      indexed_by< name("getbyuser"), const_mem_fun<profile, uint64_t, &profile::get_by_user> >
      > profiles;

    typedef eosio::multi_index< name("properties"), property,
      indexed_by< name("getbyuser"), const_mem_fun<property, uint64_t, &property::get_by_user> >
      > properties;

    typedef eosio::multi_index< name("stakers"), staker,
      indexed_by< name("getbyuser"), const_mem_fun<staker, uint64_t, &staker::get_by_user> >
      > stakers;

  public:
    using contract::contract;

    // constructor
    notechain( name receiver, name code, datastream<const char*> ds ):
                contract( receiver, code, ds ) {}

    ACTION setprofile( name user, std::string fullname, std::string photo_url) {
      // to sign the action with the given account
      require_auth( user );

      profiles _profile(_self, _self.value); // table scoped by contract

      auto profile_index = _profile.get_index<name("getbyuser")>();
      auto iterator = profile_index.find(user.value);
      bool exists = iterator != profile_index.end();

      print("Heloo ");
      if (exists) {
        auto &entry = profile_index.get(user.value);
        _profile.modify( entry, _self, [&]( auto& modified_profile ) {
          modified_profile.fullname = fullname;
          modified_profile.photo_url = photo_url;
          modified_profile.timestamp = now();
        });
      } else {
        // insert new note
        _profile.emplace( _self, [&]( auto& new_profile ) {
          new_profile.user = user;
          new_profile.fullname = fullname;
          new_profile.photo_url = photo_url;
          new_profile.prim_key = _profile.available_primary_key();
          new_profile.timestamp = now();
        });
      }

    }

    ACTION delproperty( name user, uint64_t property_id ) {
      // to sign the action with the given account
      require_auth( user );

      properties _properties(_self, _self.value); // table scoped by contract
      auto itr = _properties.find( property_id );
      eosio_assert( itr != _properties.end(), "Property does not exist." );
      _properties.erase( itr );

    }

    ACTION setproperty( name user, std::string address, std::string city,
          std::string state, std::string photo_url) {
      // to sign the action with the given account
      require_auth( user );

      properties _properties(_self, _self.value); // table scoped by contract

      _properties.emplace( _self, [&]( auto& new_profile ) {
        new_profile.user = user;
        new_profile.address = address;
        new_profile.city = city;
        new_profile.state = state;
        new_profile.photo_url = photo_url;
        new_profile.fulfilled = 0;
        new_profile.prim_key = _properties.available_primary_key();
        new_profile.timestamp = now();
      });

    }

    ACTION contribute( name user, uint64_t property_id, asset quantity ) {
      // to sign the action with the given account
      require_auth( user );

      // create new / update note depends whether the user account exist or not
      stakers _stakers(_self, property_id); // table scoped by property_id

      auto staker_index = _stakers.get_index<name("getbyuser")>();
      auto iterator = staker_index.find(user.value);
      bool exists = iterator != staker_index.end();

      if (exists) {
        auto &entry = staker_index.get(user.value);
        _stakers.modify( entry, _self, [&]( auto& modified_user ) {
          modified_user.quantity = quantity;
          modified_user.timestamp = now();
        });
      } else {
        // insert new note
        _stakers.emplace( _self, [&]( auto& new_user ) {
          new_user.user = user;
          new_user.quantity = quantity;
          new_user.prim_key = _stakers.available_primary_key();
          new_user.timestamp = now();
        });
      }

    }

};

EOSIO_DISPATCH( notechain, (setprofile)(setproperty)(delproperty)(contribute) )
