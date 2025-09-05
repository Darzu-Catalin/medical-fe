import { UserType } from '@/types/types'
import Label from '@/components/ui/minimals/label'
import { useMemo, useState, useEffect } from 'react'
import Iconify from '@/components/ui/minimals/iconify'
import { ConfirmDialog } from '@/components/ui/minimals/custom-dialog'

import { LoadingButton } from '@mui/lab'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  Card,
  Button,
  Dialog,
  Select,
  Tooltip,
  MenuItem,
  FormLabel,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material'

import { useAppSelector } from 'src/redux/store'

import { CustomAvatar } from '../custom-avatar'
import UserAutocomplete from '../user-autocomplete/user-autocomplete'

const TeamMembers = ({
  members,
  onAddMember,
  onRemoveMember,
  onEditMember,
  type,
}: {
  members: UserType[]
  onAddMember: ({ futureUser, role }: { futureUser: UserType; role: string }) => Promise<{
    error: boolean
  }>
  onRemoveMember: (member: UserType) => Promise<void>
  onEditMember: ({ futureUser, role }: { futureUser: UserType; role: string }) => Promise<{
    error: boolean
  }>
  type: 'partner' | 'business'
}) => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [addNewMemberDialogVisible, setAddNewMemberDialogVisible] = useState(false)

  return (
    <>
      <Card sx={{ p: 3, flex: 1, minHeight: '200px' }}>
        <Typography variant="h6" gutterBottom>
          Echipa
        </Typography>

        {members?.map((member) => (
          <UserListItem
            key={member.id}
            user={member}
            onClick={() => {
              setSelectedUser(member)
            }}
          />
        ))}

        <Button
          sx={{
            mt: 2,
          }}
          color="primary"
          variant="outlined"
          fullWidth
          size="large"
          onClick={() => setAddNewMemberDialogVisible(true)}
        >
          Adaugă membru
        </Button>
      </Card>

      <UserEditDialog
        type={type}
        members={members}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onRemoveMember={onRemoveMember}
        onEditMember={onEditMember}
      />

      <AddNewMemberDialog
        members={members}
        type={type}
        onAddMember={onAddMember}
        open={addNewMemberDialogVisible}
        onClose={() => setAddNewMemberDialogVisible(false)}
      />
    </>
  )
}

export default TeamMembers

const UserListItem = ({ user, onClick }: { user: UserType; onClick: () => void }) => {
  const authUser = useAppSelector((state) => state.auth.user)

  return (
    <Box
      sx={{
        p: '16px',
        flex: 1,
        display: 'flex',
        cursor: 'pointer',
        borderRadius: '10px',
        bgcolor: 'background.neutral',
        mb: 1,
        border: (theme) =>
          `1px solid ${
            authUser?.id === user.id ? theme.palette.primary.main : theme.palette.divider
          }`,
        transition: '0.3s',
        '&:hover': {
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.z24,
        },
      }}
      onClick={onClick}
    >
      <Box>
        <CustomAvatar
          sx={{
            width: 40,
            height: 40,
          }}
          src={user?.avatar?.absolute_path}
          alt={user?.firstName}
          name={user?.firstName}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            ml: 2,
          }}
        >
          <Typography variant="body2">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption">{user.email}</Typography>
        </Box>

        <Label
          variant={authUser?.id === user.id ? 'filled' : 'soft'}
          color={authUser?.id === user.id ? 'primary' : 'default'}
        >
          {user.pivot.role}
        </Label>
      </Box>
    </Box>
  )
}

const UserEditDialog = ({
  members,
  selectedUser,
  setSelectedUser,
  onRemoveMember,
  onEditMember,
  type,
}: {
  members: UserType[]
  selectedUser: UserType | null
  setSelectedUser: (param: UserType | null) => void
  onRemoveMember: (member: UserType) => void
  onEditMember: ({ futureUser, role }: { futureUser: UserType; role: string }) => Promise<{
    error: boolean
  }>
  type: 'partner' | 'business'
}) => {
  const theme = useTheme()

  const [deletedVisible, setDeletedVisible] = useState(false)

  const [localSelectedUser, setLocalSelectedUser] = useState<UserType | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setLocalSelectedUser(selectedUser)
  }, [selectedUser])

  const can = useMemo(
    () => true,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={Boolean(selectedUser)}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{
          sx: {
            overflow: 'unset',
          },
        }}
      >
        {/* Header with x */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderBottom: `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6">Detalii membru</Typography>

          <IconButton
            onClick={() => {
              setSelectedUser(null)
            }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <Typography variant="body2" gutterBottom>
            Nume: {localSelectedUser?.lastName}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Prenume: {localSelectedUser?.firstName}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Telefon: {localSelectedUser?.phone}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Email: {localSelectedUser?.email}
          </Typography>

          <Box
            sx={{
              mt: 2,
            }}
          >
            <FormLabel>Rol</FormLabel>

            <Select
              disabled={!can}
              key={localSelectedUser?.pivot.role}
              value={localSelectedUser?.pivot.role}
              onChange={(e) => {
                setLocalSelectedUser({
                  ...localSelectedUser,
                  pivot: {
                    ...localSelectedUser?.pivot,
                    // @ts-ignore
                    role: e.target.value as string,
                  },
                })
              }}
              fullWidth
              // add right info icon

              IconComponent={() => (
                <Tooltip
                  arrow
                  sx={{
                    mr: 1,
                  }}
                  title={
                    type === 'partner' ? (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Un propietar pe firmă are drepturi depline asupra acesteia și asupra
                          punctelor de lucru.
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Un manager nu poate șterge alți manageri sau propietari. Un manager nu
                          poate modifica adresa sau contactul firmei. Are drepturi depline asupra
                          punctelor de lucru.
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Angajatul nu are drepturi.
                        </Typography>
                      </Box>
                    ) : (
                      // Business
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Un propietar sau manager pe firmă are drepturi depline asupra acesteia și
                          asupra punctelor de lucru.
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Un propietar pe punct de lucru are drepturi depline asupra acestuia.
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Un manager pe punct de lucru nu poate șterge alți manageri sau propietari.
                          Un manager nu poate modifica adresa sau contactul punctului de lucru.
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Angajatul nu are drepturi.
                        </Typography>
                      </Box>
                    )
                  }
                >
                  <Iconify
                    width={24}
                    icon="mdi:information-outline"
                    sx={{ color: 'text.disabled', mr: 2 }}
                  />
                </Tooltip>
              )}
            >
              <MenuItem value="owner" disabled={!can}>
                Propietar
              </MenuItem>
              <MenuItem value="manager" disabled={!can}>
                Manager
              </MenuItem>
              <MenuItem value="employee" disabled={!can}>
                Angajat
              </MenuItem>
            </Select>
          </Box>
        </Box>

        <DialogActions>
          <Button
            variant="outlined"
            disabled={!can}
            color="error"
            onClick={() => {
              setDeletedVisible(true)
            }}
          >
            Șterge
          </Button>

          <LoadingButton
            loading={isEditing}
            disabled={!can}
            variant="contained"
            color="primary"
            onClick={async () => {
              setIsEditing(true)
              const response = await onEditMember({
                futureUser: localSelectedUser as UserType,
                role: localSelectedUser?.pivot.role as string,
              })
              setIsEditing(false)

              if (response.error) {
                return
              }

              setSelectedUser(null)
            }}
          >
            Salvează
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deletedVisible}
        onClose={() => {
          setDeletedVisible(false)
        }}
        title="Șterge membru"
        content="Ești sigur că vrei să ștergi acest membru?"
        action={
          <LoadingButton
            loading={isDeleting}
            variant="contained"
            color="error"
            onClick={async () => {
              setIsDeleting(true)
              await onRemoveMember(localSelectedUser as UserType)
              setIsDeleting(false)
              setDeletedVisible(false)
              setSelectedUser(null)
            }}
          >
            Șterge
          </LoadingButton>
        }
      />
    </>
  )
}

const AddNewMemberDialog = ({
  members,
  open,
  onClose,
  onAddMember,
  type,
}: {
  members: UserType[]
  open: boolean
  onClose: () => void
  onAddMember: ({ futureUser, role }: { futureUser: UserType; role: string }) => Promise<{
    error: boolean
  }>
  type: 'business' | 'partner'
}) => {
  const [selectedRole, setSelectedRole] = useState('employee')
  const theme = useTheme()

  const [isAdding, setIsAdding] = useState(false)
  const [selectedNewUser, setSelectedNewUser] = useState<UserType | null>(null)

  const can = useMemo(() => true, [])

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: 0,
      }}
      PaperProps={{
        sx: {
          overflow: 'unset',
        },
      }}
    >
      {/* Header with x */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          borderBottom: `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6">Adaugă membru</Typography>

        <IconButton
          onClick={() => {
            onClose()
          }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
        <UserAutocomplete
          multiple={false}
          onChange={(user) => {
            setSelectedNewUser(user)
          }}
          value={selectedNewUser}
          label="Utilizator"
        />

        <Box
          sx={{
            mt: 2,
          }}
        >
          <FormLabel sx={{ mt: 2 }}>Rol</FormLabel>
          <Select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value as string)
            }}
            fullWidth
            IconComponent={() => (
              <Tooltip
                arrow
                sx={{
                  mr: 1,
                }}
                title={
                  type === 'partner' ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Un propietar pe firmă are drepturi depline asupra acesteia și asupra
                        punctelor de lucru.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Un manager nu poate șterge alți manageri sau propietari. Un manager nu poate
                        modifica adresa sau contactul firmei. Are drepturi depline asupra punctelor
                        de lucru.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Angajatul nu are drepturi.
                      </Typography>
                    </Box>
                  ) : (
                    // Business
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Un propietar sau manager pe firmă are drepturi depline asupra acesteia și
                        asupra punctelor de lucru.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Un propietar pe punct de lucru are drepturi depline asupra acestuia.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Un manager pe punct de lucru nu poate șterge alți manageri sau propietari.
                        Un manager nu poate modifica adresa sau contactul punctului de lucru.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Angajatul nu are drepturi.
                      </Typography>
                    </Box>
                  )
                }
              >
                <Iconify
                  width={24}
                  icon="mdi:information-outline"
                  sx={{ color: 'text.disabled', mr: 2 }}
                />
              </Tooltip>
            )}
          >
            <MenuItem value="owner" disabled={!can}>
              Propietar
            </MenuItem>
            <MenuItem value="manager" disabled={!can}>
              Manager
            </MenuItem>
            <MenuItem value="employee" disabled={!can}>
              Angajat
            </MenuItem>
          </Select>
        </Box>
      </Box>

      <DialogActions>
        <LoadingButton
          loading={isAdding}
          variant="contained"
          color="primary"
          onClick={async () => {
            setIsAdding(true)
            const response = await onAddMember({
              futureUser: selectedNewUser as UserType,
              role: selectedRole,
            })

            setIsAdding(false)
            if (response.error) {
              return
            }

            onClose()
          }}
        >
          Adaugă
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
