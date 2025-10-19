import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Home as HomeIcon,
  ShoppingCart as VendasIcon,
  Assessment as ReportsIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as UserIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme";

const drawerWidth = 280;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Itens do menu baseados no tipo de usuário
  const getMenuItems = () => {
    const baseItems = [
      {
        text: "Home",
        icon: <HomeIcon />,
        path: "/",
        permission: "home",
      },
    ];

    // Admin pode ver todas as páginas
    if (isAdmin()) {
      baseItems.push(
        {
          text: "Vendas",
          icon: <VendasIcon />,
          path: "/vendas",
          permission: "vendas",
        },
        {
          text: "Relatórios",
          icon: <ReportsIcon />,
          path: "/reports",
          permission: "reports",
        }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header do Sidebar */}
      <Box
        sx={{
          p: 3,
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Janio ERP
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Sistema de Gestão
        </Typography>
      </Box>

      {/* Informações do usuário */}
      <Box sx={{ p: 2, backgroundColor: colors.background.paper }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <UserIcon sx={{ color: colors.primary.main }} />
          <Box>
            <Typography variant="subtitle2" fontWeight="medium">
              {user?.name || "Usuário"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAdmin() ? "Administrador" : "Cliente"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Menu de navegação */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isSelected}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  backgroundColor: isSelected
                    ? colors.coconutGreen[100]
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? colors.coconutGreen[200]
                      : colors.coconutGreen[50],
                  },
                  "&.Mui-selected": {
                    backgroundColor: colors.coconutGreen[100],
                    "&:hover": {
                      backgroundColor: colors.coconutGreen[200],
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: colors.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: colors.text.primary,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer do Sidebar */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          © 2024 Janio ERP
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Água de Coco
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: `1px solid ${colors.neutral[200]}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
