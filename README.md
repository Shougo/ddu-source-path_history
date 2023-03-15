# ddu-source-path_history

Path history source for ddu.vim

This source collects path history from current ddu UI.

Note: You must call this source from ddu UI.

## Required

### denops.vim

https://github.com/vim-denops/denops.vim

### ddu.vim

https://github.com/Shougo/ddu.vim

### ddu-kind-file

https://github.com/Shougo/ddu-kind-file

## Configuration

```vim
call ddu#start(#{ sources: [#{ name: 'path_history' }] })

" Define cd action for "ddu-ui-filer"
call ddu#custom#patch_global(#{
    \   sourceOptions: #{
    \     path_history: #{
    \       defaultAction: 'uiCd',
    \     },
    \   }
    \ })
call ddu#custom#action('kind', 'file', 'uiCd',
    \ { args -> UiCdAction(args) })
function! UiCdAction(args)
  let path = a:args.items[0].action.path
  let directory = path->isdirectory() ? path : path->fnamemodify(':h')

  call ddu#ui#filer#do_action('itemAction',
          \ #{ name: 'narrow', params: #{ path: directory } })
endfunction
```
